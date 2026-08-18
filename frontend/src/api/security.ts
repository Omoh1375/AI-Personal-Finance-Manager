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

export const getSecurityStatus =
  async (): Promise<SecurityStatus> => {
    const response =
      await api.get<{
        success: boolean;
        data: SecurityStatus;
      }>("/security/status");

    return response.data.data;
  };

export const changePassword =
  async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const response =
      await api.put(
        "/security/password",
        payload,
      );

    return response.data;
  };

export const setupTwoFactor =
  async (): Promise<TwoFactorSetup> => {
    const response =
      await api.post<{
        success: boolean;
        data: TwoFactorSetup;
      }>("/security/2fa/setup");

    return response.data.data;
  };

export const enableTwoFactor =
  async (
    code: string,
  ): Promise<TwoFactorEnableResponse> => {
    const response =
      await api.post<{
        success: boolean;
        data: TwoFactorEnableResponse;
      }>(
        "/security/2fa/enable",
        {
          code,
        },
      );

    return response.data.data;
  };

export const disableTwoFactor =
  async (payload: {
    password: string;
    code: string;
  }) => {
    const response =
      await api.post(
        "/security/2fa/disable",
        payload,
      );

    return response.data;
  };

export const regenerateRecoveryCodes =
  async (
    code: string,
  ): Promise<string[]> => {
    const response =
      await api.post<{
        success: boolean;
        data: {
          recovery_codes: string[];
        };
      }>(
        "/security/2fa/recovery-codes",
        {
          code,
        },
      );

    return response.data.data
      .recovery_codes;
  };