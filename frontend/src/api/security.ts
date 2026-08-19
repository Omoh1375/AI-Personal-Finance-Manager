import api from "./axios";

export interface SecurityStatus {
  success: boolean;

  two_factor_enabled: boolean;

  has_recovery_codes: boolean;

  confirmed_at?: string | null;
}

export interface TwoFactorSetupResponse {
  success: boolean;

  message: string;

  secret: string;

  qr_code_url: string;
}

export interface TwoFactorActionResponse {
  success: boolean;

  message: string;

  recovery_codes?: string[];
}

export const getSecurityStatus =
  async (): Promise<SecurityStatus> => {
    const response =
      await api.get<SecurityStatus>(
        "/security/status",
      );

    return response.data;
  };

export const setupTwoFactor =
  async (): Promise<TwoFactorSetupResponse> => {
    const response =
      await api.post<TwoFactorSetupResponse>(
        "/security/2fa/setup",
      );

    return response.data;
  };

export const enableTwoFactor =
  async (
    code: string,
  ): Promise<TwoFactorActionResponse> => {
    const response =
      await api.post<TwoFactorActionResponse>(
        "/security/2fa/enable",
        {
          code,
        },
      );

    return response.data;
  };

export const disableTwoFactor =
  async (
    code: string,
  ): Promise<TwoFactorActionResponse> => {
    const response =
      await api.post<TwoFactorActionResponse>(
        "/security/2fa/disable",
        {
          code,
        },
      );

    return response.data;
  };

export const regenerateRecoveryCodes =
  async (
    code: string,
  ): Promise<TwoFactorActionResponse> => {
    const response =
      await api.post<TwoFactorActionResponse>(
        "/security/2fa/recovery-codes",
        {
          code,
        },
      );

    return response.data;
  };