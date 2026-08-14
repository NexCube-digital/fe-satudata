export type Role = 'admin' | 'faskes' | 'pasien' | 'doctor' | 'staff';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: Role;
  nik?: string;
  phone?: string;
  avatar?: string;
  walletAddress?: string;
  hospitalId?: string | number;
  isActivated?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Session {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role: Role;
  nik?: string;
  phone?: string;
}

export interface PasswordResetPayload {
  token: string;
  newPassword?: string;
}
