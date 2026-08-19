export interface UserProfile {
  phone?: string | null;
  bio?: string | null;
  country?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  profile?: UserProfile | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string | null;
  user?: User;
  requires_two_factor?: boolean;
  challenge_token?: string;
}

export interface TwoFactorLoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}