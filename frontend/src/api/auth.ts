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
| Current authenticated profile
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
| 2FA LOGIN VERIFICATION
|--------------------------------------------------------------------------
|
| This endpoint will be connected when we finish
| enforcing 2FA during the login process.
|
*/

export interface TwoFactorLoginPayload {
  email: string;

  code: string;

  remember_me?: boolean;
}

export interface TwoFactorLoginResponse {
  success: boolean;

  message?: string;

  token: string;

  user: User;
}

export const verifyTwoFactorLogin =
  async (
    payload: TwoFactorLoginPayload,
  ): Promise<TwoFactorLoginResponse> => {
    const response =
      await api.post<TwoFactorLoginResponse>(
        "/auth/2fa/verify",
        payload,
      );

    return response.data;
  };