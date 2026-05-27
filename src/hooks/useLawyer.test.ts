import { describe, expect, it } from 'vitest';
import { normalizeVerificationStatus } from './useLawyer';

describe('normalizeVerificationStatus', () => {
  it('keeps Notion verificationStatus response shape', () => {
    const result = normalizeVerificationStatus({
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-05-27T10:00:00',
      requestedAt: '2026-05-26T10:00:00',
      rejectionReason: null,
      barAssociationNumber: '12345',
    });

    expect(result).toEqual({
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-05-27T10:00:00',
      requestedAt: '2026-05-26T10:00:00',
      rejectionReason: null,
      barAssociationNumber: '12345',
    });
  });

  it('normalizes legacy status/reviewedAt fields', () => {
    const result = normalizeVerificationStatus({
      status: 'REVIEWING',
      reviewedAt: '2026-05-27T11:00:00',
    });

    expect(result).toEqual({
      verificationStatus: 'REVIEWING',
      verifiedAt: '2026-05-27T11:00:00',
      requestedAt: null,
      rejectionReason: null,
      barAssociationNumber: null,
    });
  });
});
