import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Spinner } from '@/components/ui';
import { userApi } from '@/lib/userApi';

interface ProfileImageUploaderProps {
  currentUrl: string | null;
  /** Avatar fallback 이니셜 생성용 (변호사 이름 등) */
  name?: string | null;
  /** Avatar 픽셀 크기. 기본 96. */
  size?: number;
  onUploaded: (newUrl: string) => void;
  onDeleted: () => void;
  className?: string;
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

function pickServerErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const resp = (e as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  return fallback;
}

/**
 * 변호사 본인이 자기 프로필 이미지를 업로드/교체/삭제하는 컴포넌트.
 * BE PR #98 의 `/api/users/me/profile-image` endpoint 사용.
 */
export function ProfileImageUploader({
  currentUrl,
  name,
  size = 96,
  onUploaded,
  onDeleted,
  className,
}: ProfileImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 부모가 currentUrl 을 갱신할 때 (예: 다른 폼 reset) 따라가도록
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  // ObjectURL 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function clearObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  }

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED_MIME.has(file.type)) {
      setError('JPEG / PNG / WEBP 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size === 0) {
      setError('빈 파일입니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 즉시 미리보기 (낙관적 표시)
    const localUrl = URL.createObjectURL(file);
    clearObjectUrl();
    setObjectUrl(localUrl);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const { data } = await userApi.uploadProfileImage(file);
      const newUrl = data.data?.profileImageUrl ?? null;
      if (newUrl) {
        setPreviewUrl(newUrl);
        clearObjectUrl();
        onUploaded(newUrl);
      }
    } catch (e) {
      setError(pickServerErrorMessage(e, '프로필 이미지 업로드에 실패했습니다.'));
      // 실패 시 이전 이미지로 롤백
      setPreviewUrl(currentUrl);
      clearObjectUrl();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (uploading || deleting) return;
    if (!previewUrl) return;
    if (!window.confirm('프로필 이미지를 삭제하시겠습니까?')) return;

    setError(null);
    setDeleting(true);
    try {
      await userApi.deleteProfileImage();
      setPreviewUrl(null);
      clearObjectUrl();
      onDeleted();
    } catch (e) {
      setError(pickServerErrorMessage(e, '프로필 이미지 삭제에 실패했습니다.'));
    } finally {
      setDeleting(false);
    }
  }

  function openFilePicker() {
    if (uploading || deleting) return;
    inputRef.current?.click();
  }

  const busy = uploading || deleting;
  const showDelete = !!previewUrl && !uploading;

  return (
    <div className={cn('flex w-auto max-w-full flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <Avatar url={previewUrl} name={name} size={size} />

        {/* 업로드/삭제 진행 중 오버레이 */}
        {busy && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
            aria-live="polite"
          >
            <Spinner size="md" />
          </div>
        )}

        {/* 카메라 버튼 (우측 하단) */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={busy}
          aria-label={previewUrl ? '프로필 이미지 변경' : '프로필 이미지 업로드'}
          className={cn(
            'absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8',
            'bg-brand text-white shadow-md transition-colors',
            'hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            busy && 'cursor-not-allowed opacity-50',
          )}
        >
          <Camera size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // 같은 파일 재선택 가능하도록 reset
          e.target.value = '';
        }}
      />

      {showDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className={cn(
            'inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors',
            busy && 'cursor-not-allowed opacity-50',
          )}
        >
          <Trash2 size={12} aria-hidden="true" />
          이미지 삭제
        </button>
      )}

      {/* 안내문 */}
      <p className="max-w-24 text-center text-[11px] leading-snug text-gray-400">
        JPEG / PNG / WEBP · 최대 5MB
      </p>

      {error && (
        <p className="text-xs text-red-500 leading-snug" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
