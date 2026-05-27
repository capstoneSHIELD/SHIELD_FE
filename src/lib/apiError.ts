import { isAxiosError } from 'axios';

export function getApiErrorMessage(
  error: unknown,
  fallback = '요청 처리 중 오류가 발생했습니다.',
): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  return fallback;
}

export function isApiErrorStatus(error: unknown, status: number): boolean {
  return isAxiosError(error) && error.response?.status === status;
}
