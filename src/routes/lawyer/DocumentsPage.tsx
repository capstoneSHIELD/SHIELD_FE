import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/lib/api';
import { Button, Card, Spinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';

// ─── types ───────────────────────────────────────────────────────────────────

interface DocumentItem {
  documentId: string;
  fileName: string;
  fileUrl?: string;
  createdAt: string;
}

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface SelectedFile {
  id: string;
  file: File;
  status: UploadStatus;
  errorMsg?: string;
}

// ─── constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTS = '.pdf,.jpg,.jpeg,.png';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function fileTypeLabel(name: string): string {
  return name.split('.').pop()?.toUpperCase() ?? '';
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
      return 'text-blue-500';
    case 'success':
      return 'text-emerald-600';
    case 'error':
      return 'text-red-500';
  }
}

// ─── page ────────────────────────────────────────────────────────────────────

export function DocumentsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ data: DocumentItem[] }>('/lawyers/me/documents');
      setDocuments(data.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
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
      const error = validateFile(file);
      if (error) {
        errors.push(error);
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
        await api.post('/lawyers/me/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updateFileStatus(sf.id, 'success');
      } catch {
        updateFileStatus(sf.id, 'error');
      }
    }

    setIsUploading(false);
    await fetchDocuments();

    // 성공한 파일은 2초 후 자동 제거
    setTimeout(() => {
      setSelectedFiles((prev) => prev.filter((f) => f.status !== 'success'));
    }, 2000);
  }

  const pendingCount = selectedFiles.filter((f) => f.status === 'pending').length;

  return (
    <div className="flex flex-col flex-1">
      <Header title="서류 관리" showBack onBack={() => navigate(-1)} />

      <main className="flex-1 px-4 py-4 pb-10 space-y-4">
        {/* Upload section */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">서류 업로드</h2>

          {/* Drag & drop area — 선택된 파일이 없을 때만 표시 */}
          {selectedFiles.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center gap-2',
                'border-2 border-dashed rounded-xl py-6 px-4',
                'cursor-pointer transition-colors duration-150',
                isDragging
                  ? 'border-brand bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              <Upload
                size={24}
                className={cn(
                  'transition-colors',
                  isDragging ? 'text-brand' : 'text-gray-400',
                )}
              />
              <p className="text-sm text-gray-600 text-center">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-400">
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

          {/* Validation error */}
          {validationError && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 whitespace-pre-line">
                {validationError}
              </p>
            </div>
          )}

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2" role="list">
              {selectedFiles.map((sf) => {
                const { bgColor, iconColor, Icon } = getFileTypeInfo(sf.file);
                return (
                  <li
                    key={sf.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                        bgColor,
                      )}
                    >
                      <Icon size={20} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-gray-900 truncate"
                        title={sf.file.name}
                      >
                        {sf.file.name}
                      </p>
                      <p className="text-xs mt-0.5">
                        <span className="text-gray-400">
                          {formatFileSize(sf.file.size)}
                        </span>
                        <span className="text-gray-300 mx-1.5">·</span>
                        <span className={statusColor(sf.status)}>
                          {statusLabel(sf.status)}
                        </span>
                      </p>
                    </div>
                    {sf.status !== 'uploading' && (
                      <button
                        type="button"
                        onClick={() => removeFile(sf.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                        aria-label={`${sf.file.name} 제거`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
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

          <p className="mt-2 text-xs text-gray-400 text-center">
            업로드 버튼을 눌러야 선택한 파일이 업로드 됩니다.
          </p>
        </Card>

        {/* Documents list */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">제출된 서류</h2>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner size="md" />
            </div>
          ) : documents.length === 0 ? (
            <Card padding="md" className="text-center py-8">
              <FileText size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">제출된 서류가 없습니다</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <Card key={doc.documentId} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0">
                      <FileText size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fileTypeLabel(doc.fileName)} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand font-medium hover:text-blue-700 transition-colors flex-shrink-0"
                      >
                        보기
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
