import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/cn';
import { deliveryTimeRemaining, formatDate } from '@/lib/dateUtils';
import { useInboxDetail, useUpdateInboxStatus } from '@/hooks/useInbox';
import { Button, Modal, Spinner } from '@/components/ui';
import {
  LawyerCard,
  LawyerDomainPill,
  LawyerHeader,
  LawyerPage,
  LawyerStatusPill,
} from '@/components/lawyer/LawyerChrome';

const textareaClass = cn(
  'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#1E293B]',
  'placeholder:text-[#64748B] resize-none',
  'outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
  'transition-colors duration-150',
);

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-info-bg px-2.5 py-[3px] text-[11px] font-semibold text-brand">
      {children}
    </span>
  );
}

export function InboxDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: brief, isLoading } = useInboxDetail(id);
  const updateStatus = useUpdateInboxStatus(id);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const briefStatus = brief?.status as string | undefined;
  const isPending = briefStatus === 'DELIVERED' && !brief?.isExpired;

  async function handleAccept() {
    await updateStatus.mutateAsync({ status: 'CONFIRMED' });
    setConfirmModalOpen(false);
    setSuccessMessage('의뢰를 수락했습니다.');
    setTimeout(() => navigate('/lawyer/inbox'), 1500);
  }

  async function handleReject() {
    await updateStatus.mutateAsync({
      status: 'REJECTED',
      rejectionReason: rejectReason || undefined,
    });
    setRejectModalOpen(false);
    setSuccessMessage('의뢰를 거절했습니다.');
    setTimeout(() => navigate('/lawyer/inbox'), 1500);
  }

  if (isLoading) {
    return (
      <LawyerPage>
        <LawyerHeader title="의뢰서 상세" showBack onBack={() => navigate('/lawyer/inbox')} />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </LawyerPage>
    );
  }

  if (!brief) {
    return (
      <LawyerPage>
        <LawyerHeader title="의뢰서 상세" showBack onBack={() => navigate('/lawyer/inbox')} />
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="text-sm text-gray-500">의뢰서를 찾을 수 없습니다.</p>
        </div>
      </LawyerPage>
    );
  }

  return (
    <LawyerPage>
      <LawyerHeader title="의뢰서 상세" showBack onBack={() => navigate('/lawyer/inbox')} />

      <main className="flex-1 px-4 py-4 pb-28">
        {successMessage && (
          <div className="mb-4 rounded-card border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        )}

        {isPending && (
          <div className="mb-4 rounded-card border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              24시간 이내 응답 없으면 자동 거절됩니다.
              {deliveryTimeRemaining(brief.sentAt) && (
                <span> {deliveryTimeRemaining(brief.sentAt)}</span>
              )}
            </p>
          </div>
        )}

        <LawyerCard className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-bg text-brand">
              <Scale size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold leading-snug text-[#111827]">
                  {brief.title}
                </h2>
                <LawyerStatusPill status={briefStatus} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <LawyerDomainPill legalField={brief.legalField} />
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{formatDate(brief.sentAt)}</span>
              </div>
            </div>
          </div>

          {brief.content && (
            <section className="space-y-2">
              <SectionLabel>내용</SectionLabel>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#111827]">
                {brief.content}
              </p>
            </section>
          )}

          {brief.keyIssues && brief.keyIssues.length > 0 && (
            <section className="space-y-2 border-t border-gray-200 pt-4">
              <SectionLabel>주요 쟁점</SectionLabel>
              <ul className="space-y-1.5">
                {brief.keyIssues.map((issue, index) => (
                  <li key={`${issue.title}-${index}`} className="flex items-start gap-2 text-sm text-[#111827]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{issue.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {brief.keywords && brief.keywords.length > 0 && (
            <section className="space-y-2 border-t border-gray-200 pt-4">
              <SectionLabel>키워드</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {brief.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex rounded-full bg-info-bg px-2.5 py-1 text-xs font-medium text-brand"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {brief.clientName && (
            <section className="space-y-2 border-t border-gray-200 pt-4">
              <SectionLabel>의뢰인</SectionLabel>
              <p className="text-sm text-[#111827]">{brief.clientName}</p>
            </section>
          )}
        </LawyerCard>
      </main>

      {isPending && !successMessage && (
        <div className="sticky bottom-20 z-30 space-y-2.5 border-t border-gray-100 bg-white px-5 py-4 lg:bottom-0">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            className="rounded-card"
            onClick={() => setConfirmModalOpen(true)}
          >
            수락하기
          </Button>
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            className="rounded-card border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setRejectModalOpen(true)}
          >
            거절하기
          </Button>
        </div>
      )}

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="의뢰 수락"
      >
        <p className="mb-5 text-sm text-gray-700">
          이 의뢰를 수락하시겠습니까?
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            fullWidth
            isLoading={updateStatus.isPending}
            onClick={handleAccept}
          >
            수락
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setConfirmModalOpen(false)}
          >
            취소
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="의뢰 거절"
      >
        <div className="mb-5 space-y-3">
          <p className="text-sm text-gray-700">이 의뢰를 거절하시겠습니까?</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1E293B]">
              거절 사유 <span className="font-normal text-gray-400">(선택)</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="거절 사유를 입력해주세요"
              className={textareaClass}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="danger"
            fullWidth
            isLoading={updateStatus.isPending}
            onClick={handleReject}
          >
            거절
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setRejectModalOpen(false)}
          >
            취소
          </Button>
        </div>
      </Modal>
    </LawyerPage>
  );
}
