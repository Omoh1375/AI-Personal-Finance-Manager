import api from "./axios";

export interface SecurityStatus {
  two_factor_enabled: boolean;
  has_recovery_codes: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  otpauth_url: string;
}

export interface TwoFactorEnableResponse {
  two_factor_enabled: boolean;
  recovery_codes: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getSecurityStatus =
  async (): Promise<SecurityStatus> => {
    const response =
      await api.get<ApiResponse<SecurityStatus>>(
        "/security/status",
      );

    return response.data.data;
  };

export const changePassword = async (
  payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  },
): Promise<void> => {
  await api.put(
    "/security/password",
    payload,
  );
};

export const setupTwoFactor =
  async (): Promise<TwoFactorSetup> => {
    const response =
      await api.post<
        ApiResponse<TwoFactorSetup>
      >(
        "/security/2fa/setup",
      );

    return response.data.data;
  };

export const enableTwoFactor =
  async (
    code: string,
  ): Promise<TwoFactorEnableResponse> => {
    const response =
      await api.post<
        ApiResponse<TwoFactorEnableResponse>
      >(
        "/security/2fa/enable",
        { code },
      );

    return response.data.data;
  };

export const disableTwoFactor =
  async (payload: {
    password: string;
    code: string;
  }): Promise<void> => {
    await api.post(
      "/security/2fa/disable",
      payload,
    );
  };

export const regenerateRecoveryCodes =
  async (
    code: string,
  ): Promise<string[]> => {
    const response =
      await api.post<
        ApiResponse<{
          recovery_codes: string[];
        }>
      >(
        "/security/2fa/recovery-codes",
        { code },
      );

    return response.data.data
      .recovery_codes;
  };