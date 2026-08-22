import api from "./axios";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TwoFactorLoginResponse,
  User,
} from "../types/auth";

export interface LoginResponse {
  success: boolean;
  message?: string;

  requires_two_factor?: boolean;

  challenge_token?: string;

  token?: string;

  user?: User;
}

export const login = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response =
    await api.post<LoginResponse>(
      "/auth/login",
      payload,
    );

  return response.data;
};

export const verifyTwoFactorLogin =
  async (
    challengeToken: string,
    code: string,
  ): Promise<TwoFactorLoginResponse> => {
    const response =
      await api.post<TwoFactorLoginResponse>(
        "/auth/2fa/verify-login",
        {
          challenge_token:
            challengeToken,

          code,
        },
      );

    return response.data;
  };

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

export const logout =
  async (): Promise<void> => {
    await api.post(
      "/auth/logout",
    );
  };

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