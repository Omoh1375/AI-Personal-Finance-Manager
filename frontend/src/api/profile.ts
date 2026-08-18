import api from "./axios";

import type {
  ProfilePayload,
  ProfileResponse,
  ProfileUser,
} from "../types/profile";

export const getProfile =
  async (): Promise<ProfileUser> => {
    const response =
      await api.get<ProfileResponse>(
        "/profile",
      );

    return (
      response.data.data ??
      response.data.user!
    );
  };

export const updateProfile =
  async (
    payload: ProfilePayload,
  ): Promise<ProfileUser> => {
    const response =
      await api.put<ProfileResponse>(
        "/profile",
        payload,
      );

    return (
      response.data.data ??
      response.data.user!
    );
  };

export const uploadProfilePhoto =
  async (
    file: File,
  ): Promise<ProfileUser> => {
    const formData =
      new FormData();

    formData.append(
      "profile_picture",
      file,
    );

    const response =
      await api.post<ProfileResponse>(
        "/profile/photo",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        },
      );

    return (
      response.data.data ??
      response.data.user!
    );
  };

export const deleteProfilePhoto =
  async (): Promise<ProfileUser> => {
    const response =
      await api.delete<ProfileResponse>(
        "/profile/photo",
      );

    return (
      response.data.data ??
      response.data.user!
    );
  };