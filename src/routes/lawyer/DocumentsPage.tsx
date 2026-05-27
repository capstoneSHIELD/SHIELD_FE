import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/lib/apiError';
import { ACCEPTED_FILE_EXTS, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { useMyDocuments, useUploadDocument } from '@/hooks/useLawyer';
import { Button, Spinner } from '@/components/ui';
import {
  LawyerCard,
  LawyerEmptyState,
  LawyerErrorState,
  LawyerHeader,
  LawyerPage,
} from '@/components/lawyer/LawyerChrome';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface SelectedFile {
  id: string;
  file: File;
  status: UploadStatus;
  errorMsg?: string;
}

const ACCEPTED_EXTS = ACCEPTED_FILE_EXTS.join(',');

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function fileTypeLabel(name: string, fileType?: string): string {
  return fileType || name.split('.').pop()?.toUpperCase() || '';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileTypeInfo(file: File) {
  if (file.type === 'application/pdf') {
    return {
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      Icon: FileText,
    };
  }
  if (file.type.startsWith('image/')) {
    return {
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      Icon: ImageIcon,
    };
  }
  return {
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-500',
    Icon: FileText,
  };
}

function statusLabel(status: UploadStatus): string {
  switch (status) {
    case 'pending':
      return '업로드 대기 중';
    case 'uploading':
      return '업로드 중...';
    case 'success':
      return '업로드 완료';
    case 'error':
      return '업로드 실패';
  }
}

function statusColor(status: UploadStatus): string {
  switch (status) {
    case 'pending':
      return 'text-gray-400';
    case 'uploading':
      return 'text-brand';
    case 'success':
      return 'text-emerald-600';
    case 'error':
      return 'text-red-500';
  }
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDocument = useUploadDocument();

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useMyDocuments();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [validationError, setValidationError] = useState('');

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `${file.name}: PDF, JPG, PNG 파일만 업로드 가능합니다.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: 파일 크기는 10MB 이하여야 합니다.`;
    }
    return null;
  }

  function handleFilesSelect(files: File[]) {
    setValidationError('');
    const errors: string[] = [];
    const valid: SelectedFile[] = [];

    files.forEach((file) => {
      const errorMessage = validateFile(file);
      if (errorMessage) {
        errors.push(errorMessage);
      } else {
        valid.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          status: 'pending',
        });
      }
    });

    if (errors.length > 0) setValidationError(errors.join('\n'));
    if (valid.length > 0) setSelectedFiles((prev) => [...prev, ...valid]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) handleFilesSelect(files);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0) handleFilesSelect(files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDropzoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  }

  function removeFile(id: string) {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFileStatus(id: string, status: UploadStatus, errorMsg?: string) {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, errorMsg } : f)),
    );
  }

  async function handleUpload() {
    const pending = selectedFiles.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);

    for (const sf of pending) {
      updateFileStatus(sf.id, 'uploading');
      try {
        const formData = new FormData();
        formData.append('file', sf.file);
        await uploadDocument.mutateAsync(formData);
        updateFileStatus(sf.id, 'success');
      } catch (err) {
        updateFileStatus(
          sf.id,
          'error',
          getApiErrorMessage(err, '파일 업로드에 실패했습니다.'),
        );
      }
    }

    setIsUploading(false);

    setTimeout(() => {
      setSelectedFiles((prev) => prev.filter((f) => f.status !== 'success'));
    }, 2000);
  }

  const pendingCount = selectedFiles.filter((f) => f.status === 'pending').length;

  return (
    <LawyerPage>
      <LawyerHeader title="서류 관리" showBack onBack={() => navigate(-1)} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24 lg:py-6">
        <div className="space-y-4">
          <LawyerCard className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">서류 업로드</h2>

            {selectedFiles.length === 0 && (
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFilePicker}
                onKeyDown={handleDropzoneKeyDown}
                className={cn(
                  'flex flex-col items-center justify-center gap-2',
                  'rounded-card border-2 border-dashed px-4 py-6',
                  'cursor-pointer transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                  isDragging
                    ? 'border-brand bg-info-bg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <Upload
                  size={24}
                  className={cn(
                    'transition-colors',
                    isDragging ? 'text-brand' : 'text-gray-400',
                  )}
                  aria-hidden="true"
                />
                <p className="text-center text-sm text-gray-600">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-center text-xs text-gray-400">
                  PDF, JPG, PNG · 최대 10MB · 여러 파일 선택 가능
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS}
              multiple
              onChange={handleInputChange}
              className="hidden"
              aria-label="파일 선택"
            />

            {validationError && (
              <div className="mt-3 flex items-start gap-2 rounded-card bg-red-50 px-3 py-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" aria-hidden="true" />
                <p className="whitespace-pre-line text-xs text-red-600" role="alert">
                  {validationError}
                </p>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2" role="list">
                {selectedFiles.map((sf) => {
                  const { bgColor, iconColor, Icon } = getFileTypeInfo(sf.file);
                  return (
                    <li
                      key={sf.id}
                      className="flex items-center gap-3 rounded-card border border-gray-200 bg-white px-3 py-2.5"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                          bgColor,
                        )}
                      >
                        <Icon size={20} className={iconColor} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium text-gray-900"
                          title={sf.file.name}
                        >
                          {sf.file.name}
                        </p>
                        <p className="mt-0.5 text-xs">
                          <span className="text-gray-400">
                            {formatFileSize(sf.file.size)}
                          </span>
                          <span className="mx-1.5 text-gray-300">·</span>
                          <span className={statusColor(sf.status)}>
                            {statusLabel(sf.status)}
                          </span>
                        </p>
                        {sf.errorMsg && (
                          <p className="mt-1 text-xs text-red-500" role="alert">
                            {sf.errorMsg}
                          </p>
                        )}
                      </div>
                      {sf.status !== 'uploading' && (
                        <button
                          type="button"
                          onClick={() => removeFile(sf.id)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                          aria-label={`${sf.file.name} 제거`}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                fullWidth
                onClick={openFilePicker}
                leftIcon={<Upload size={15} />}
                disabled={isUploading}
              >
                파일 선택
              </Button>
              {pendingCount > 0 && (
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={isUploading}
                  onClick={handleUpload}
                >
                  {pendingCount}개 업로드
                </Button>
              )}
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              업로드 버튼을 눌러야 선택한 파일이 업로드 됩니다.
            </p>
          </LawyerCard>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">제출된 서류</h2>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner size="md" text="서류를 불러오는 중..." />
              </div>
            ) : isError ? (
              <LawyerErrorState description={getApiErrorMessage(error, '제출된 서류를 불러오지 못했습니다.')} />
            ) : documents.length === 0 ? (
              <LawyerEmptyState
                title="제출된 서류가 없습니다"
                description="변호사 인증에 필요한 서류를 업로드해주세요."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <LawyerCard key={doc.documentId} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FileText size={18} className="text-gray-500" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {doc.fileName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {fileTypeLabel(doc.fileName, doc.fileType)} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-medium text-brand transition-colors hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                          보기
                        </a>
                      )}
                    </div>
                  </LawyerCard>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </LawyerPage>
  );
}
