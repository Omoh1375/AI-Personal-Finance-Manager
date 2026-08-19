import api from "./axios";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const response =
    await api.post<AuthResponse>(
      "/auth/login",
      payload,
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const register = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response =
    await api.post<AuthResponse>(
      "/auth/register",
      payload,
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout =
  async (): Promise<void> => {
    await api.post(
      "/auth/logout",
    );
  };

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

export const getProfile =
  async (): Promise<User> => {
    const response =
      await api.get<{
        success: boolean;
        user: User;
      }>(
        "/auth/profile",
      );

    return response.data.user;
  };

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;

  message: string;
}

export const forgotPassword =
  async (
    payload: ForgotPasswordPayload,
  ): Promise<ForgotPasswordResponse> => {
    const response =
      await api.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        payload,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export interface ResetPasswordPayload {
  token: string;

  email: string;

  password: string;

  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;

  message: string;
}

export const resetPassword =
  async (
    payload: ResetPasswordPayload,
  ): Promise<ResetPasswordResponse> => {
    const response =
      await api.post<ResetPasswordResponse>(
        "/auth/reset-password",
        payload,
      );

    return response.data;
  };