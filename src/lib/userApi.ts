import api from './api';
import type { ApiResponse } from '@/types/api';
import type { UserInfo } from '@/types/auth';

const BASE = '/users';

export interface ProfileImageResponse {
  profileImageUrl: string | null;
}

export const userApi = {
  /** 내 정보 조회 */
  getMe: () =>
    api.get<ApiResponse<UserInfo>>(`${BASE}/me`),

  /** 내 정보 수정 */
  updateMe: (data: Partial<Pick<UserInfo, 'name' | 'email'>>) =>
    api.patch<ApiResponse<UserInfo>>(`${BASE}/me`, data),

  /** 프로필 이미지 업로드/교체 (multipart) — BE PR #98 */
  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<ProfileImageResponse>>(
      `${BASE}/me/profile-image`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  /** 프로필 이미지 삭제 — BE PR #98 */
  deleteProfileImage: () =>
    api.delete<ApiResponse<ProfileImageResponse>>(`${BASE}/me/profile-image`),
};
