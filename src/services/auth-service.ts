import { apiGet, apiPost } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { LoginPayload, RegisterPayload, PasswordResetPayload, User } from '@/types/auth';

export const loginUser = async (payload: LoginPayload): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
  return await apiPost('/api/auth/login', payload);
};

export const registerUser = async (payload: RegisterPayload): Promise<ApiResponse<User>> => {
  return await apiPost('/api/auth/register', payload);
};

export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  return await apiPost('/api/auth/forgot-password', { email });
};

export const resetPassword = async (payload: PasswordResetPayload): Promise<ApiResponse> => {
  return await apiPost('/api/auth/reset-password', payload);
};

export const activateAccount = async (token: string): Promise<ApiResponse> => {
  return await apiPost('/api/auth/activate', { token });
};

export const getMe = async (): Promise<ApiResponse<User>> => {
  return await apiGet('/api/auth/me');
};

export default {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  activateAccount,
  getMe,
};
