import type {
  ClassificationCandidate,
  ClassificationResolution,
  ConsultationResponse,
} from '@/types/consultation';

type CandidateLike = Partial<ClassificationCandidate> | null | undefined;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function normalizeCandidate(candidate: CandidateLike): ClassificationCandidate {
  return {
    domains: asStringArray(candidate?.domains),
    subDomains: asStringArray(candidate?.subDomains),
    tags: asStringArray(candidate?.tags),
  };
}

export function hasCandidateValues(candidate: ClassificationCandidate | null | undefined) {
  return Boolean(
    candidate &&
      (candidate.domains.length > 0 ||
        candidate.subDomains.length > 0 ||
        candidate.tags.length > 0),
  );
}

export function normalizeClassificationResolution(
  value: unknown,
): ClassificationResolution | null {
  if (!value || typeof value !== 'object') return null;

  const source = value as Partial<ClassificationResolution>;
  const userCandidate = normalizeCandidate(source.userCandidate);
  const aiCandidate = normalizeCandidate(source.aiCandidate);
  const effectiveCandidate = source.effectiveCandidate
    ? normalizeCandidate(source.effectiveCandidate)
    : null;

  if (
    !source.conflict &&
    !hasCandidateValues(userCandidate) &&
    !hasCandidateValues(aiCandidate) &&
    !hasCandidateValues(effectiveCandidate)
  ) {
    return null;
  }

  return {
    conflict: source.conflict === true,
    userCandidate: hasCandidateValues(userCandidate) ? userCandidate : null,
    aiCandidate: hasCandidateValues(aiCandidate) ? aiCandidate : null,
    effectiveCandidate,
  };
}

export function buildConflictFromConsultation(
  consultation: ConsultationResponse | null | undefined,
): ClassificationResolution | null {
  if (!consultation) return null;

  const explicit = normalizeClassificationResolution(consultation.classification);
  if (explicit?.conflict) return explicit;

  const userCandidate = normalizeCandidate({
    domains: consultation.userDomains ?? [],
    subDomains: consultation.userSubDomains ?? [],
    tags: consultation.userTags ?? [],
  });
  const aiCandidate = normalizeCandidate({
    domains: consultation.aiDomains ?? [],
    subDomains: consultation.aiSubDomains ?? [],
    tags: consultation.aiTags ?? [],
  });

  if (!hasCandidateValues(userCandidate) || !hasCandidateValues(aiCandidate)) {
    return null;
  }

  return {
    conflict: true,
    userCandidate,
    aiCandidate,
    effectiveCandidate: null,
  };
}

export function getConflictResolutionFromUnknown(value: unknown) {
  const direct = normalizeClassificationResolution(value);
  if (direct?.conflict) return direct;

  if (!value || typeof value !== 'object') return null;
  const source = value as {
    data?: unknown;
    classification?: unknown;
  };

  const fromClassification = normalizeClassificationResolution(source.classification);
  if (fromClassification?.conflict) return fromClassification;

  const fromData = normalizeClassificationResolution(source.data);
  if (fromData?.conflict) return fromData;

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as { classification?: unknown };
    const fromNested = normalizeClassificationResolution(nested.classification);
    if (fromNested?.conflict) return fromNested;
  }

  return null;
}
