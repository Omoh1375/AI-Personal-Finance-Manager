import api from "./axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

export const login = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
};

export const register = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get<{
    success: boolean;
    user: User;
  }>("/auth/profile");

  return response.data.user;
};