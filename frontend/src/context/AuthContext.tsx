import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/auth";

import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

interface LoginResult {
  requiresTwoFactor: boolean;
  challengeToken?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    payload: LoginPayload,
  ) => Promise<LoginResult>;

  completeTwoFactorLogin: (
    user: User,
    token: string,
  ) => void;

  updateUser: (
    user: User,
  ) => void;

  refreshUser: () => Promise<void>;

  register: (
    payload: RegisterPayload,
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

function getStoredUser(): User | null {
  const stored =
    localStorage.getItem(
      "auth_user",
    );

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(
      stored,
    ) as User;
  } catch {
    localStorage.removeItem(
      "auth_user",
    );

    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    getStoredUser,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "auth_token",
      );

    if (!token) {
      setIsLoading(false);

      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);

        localStorage.setItem(
          "auth_user",
          JSON.stringify(
            profile,
          ),
        );
      })
      .catch(() => {
        localStorage.removeItem(
          "auth_token",
        );

        localStorage.removeItem(
          "auth_user",
        );

        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update authenticated user
  |--------------------------------------------------------------------------
  */

  const updateUser = (
    updatedUser: User,
  ) => {
    setUser(
      updatedUser,
    );

    localStorage.setItem(
      "auth_user",
      JSON.stringify(
        updatedUser,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Refresh authenticated user from backend
  |--------------------------------------------------------------------------
  */

  const refreshUser =
    async () => {
      const profile =
        await getProfile();

      updateUser(
        profile,
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = async (
    payload: LoginPayload,
  ): Promise<LoginResult> => {
    const data =
      await loginRequest(
        payload,
      );

    if (
      data.requires_two_factor &&
      data.challenge_token
    ) {
      return {
        requiresTwoFactor: true,

        challengeToken:
          data.challenge_token,
      };
    }

    if (
      !data.token ||
      !data.user
    ) {
      throw new Error(
        "Authentication response is incomplete.",
      );
    }

    updateUser(
      data.user,
    );

    localStorage.setItem(
      "auth_token",
      data.token,
    );

    return {
      requiresTwoFactor: false,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Complete 2FA login
  |--------------------------------------------------------------------------
  */

  const completeTwoFactorLogin =
    (
      authenticatedUser: User,
      token: string,
    ) => {
      localStorage.setItem(
        "auth_token",
        token,
      );

      updateUser(
        authenticatedUser,
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  const register = async (
    payload: RegisterPayload,
  ) => {
    const data =
      await registerRequest(
        payload,
      );

    if (
      !data.token ||
      !data.user
    ) {
      throw new Error(
        "Registration response is incomplete.",
      );
    }

    localStorage.setItem(
      "auth_token",
      data.token,
    );

    updateUser(
      data.user,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem(
        "auth_token",
      );

      localStorage.removeItem(
        "auth_user",
      );

      sessionStorage.removeItem(
        "two_factor_challenge",
      );

      setUser(null);
    }
  };

  const value =
    useMemo(
      () => ({
        user,
        isAuthenticated:
          Boolean(user),
        isLoading,

        login,

        completeTwoFactorLogin,

        updateUser,

        refreshUser,

        register,

        logout,
      }),
      [
        user,
        isLoading,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}