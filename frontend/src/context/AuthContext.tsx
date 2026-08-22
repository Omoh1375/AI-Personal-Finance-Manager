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

/*
|--------------------------------------------------------------------------
| Storage helpers
|--------------------------------------------------------------------------
*/

const AUTH_TOKEN_KEY =
  "auth_token";

const AUTH_USER_KEY =
  "auth_user";

const TWO_FACTOR_CHALLENGE_KEY =
  "two_factor_challenge";

function getStoredUser(): User | null {
  const stored =
    localStorage.getItem(
      AUTH_USER_KEY,
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
      AUTH_USER_KEY,
    );

    return null;
  }
}

function clearAuthenticationState(): void {
  localStorage.removeItem(
    AUTH_TOKEN_KEY,
  );

  localStorage.removeItem(
    AUTH_USER_KEY,
  );

  sessionStorage.removeItem(
    TWO_FACTOR_CHALLENGE_KEY,
  );
}

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

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

  /*
  |--------------------------------------------------------------------------
  | Restore existing authenticated session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token =
      localStorage.getItem(
        AUTH_TOKEN_KEY,
      );

    if (!token) {
      setIsLoading(false);

      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);

        localStorage.setItem(
          AUTH_USER_KEY,
          JSON.stringify(
            profile,
          ),
        );
      })
      .catch(() => {
        clearAuthenticationState();

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
      AUTH_USER_KEY,
      JSON.stringify(
        updatedUser,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Refresh authenticated user
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
    /*
    |--------------------------------------------------------------------------
    | Clear any stale 2FA challenge before starting
    | a completely new login attempt.
    |--------------------------------------------------------------------------
    */

    sessionStorage.removeItem(
      TWO_FACTOR_CHALLENGE_KEY,
    );

    const data =
      await loginRequest(
        payload,
      );

    /*
    |--------------------------------------------------------------------------
    | 2FA required
    |--------------------------------------------------------------------------
    */

    if (
      data.requires_two_factor &&
      data.challenge_token
    ) {
      sessionStorage.setItem(
        TWO_FACTOR_CHALLENGE_KEY,
        data.challenge_token,
      );

      return {
        requiresTwoFactor: true,

        challengeToken:
          data.challenge_token,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Normal login
    |--------------------------------------------------------------------------
    */

    if (
      !data.token ||
      !data.user
    ) {
      throw new Error(
        "Authentication response is incomplete.",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Make sure no stale challenge remains.
    |--------------------------------------------------------------------------
    */

    sessionStorage.removeItem(
      TWO_FACTOR_CHALLENGE_KEY,
    );

    localStorage.setItem(
      AUTH_TOKEN_KEY,
      data.token,
    );

    updateUser(
      data.user,
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

  const completeTwoFactorLogin = (
    authenticatedUser: User,
    token: string,
  ) => {
    localStorage.setItem(
      AUTH_TOKEN_KEY,
      token,
    );

    updateUser(
      authenticatedUser,
    );

    /*
    |--------------------------------------------------------------------------
    | The challenge has now been consumed.
    |--------------------------------------------------------------------------
    */

    sessionStorage.removeItem(
      TWO_FACTOR_CHALLENGE_KEY,
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

    /*
    |--------------------------------------------------------------------------
    | Registration creates an authenticated session,
    | so any stale 2FA challenge should be removed.
    |--------------------------------------------------------------------------
    */

    sessionStorage.removeItem(
      TWO_FACTOR_CHALLENGE_KEY,
    );

    localStorage.setItem(
      AUTH_TOKEN_KEY,
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
      /*
      |--------------------------------------------------------------------------
      | Only call the backend when we actually have
      | an authenticated token.
      |--------------------------------------------------------------------------
      */

      const token =
        localStorage.getItem(
          AUTH_TOKEN_KEY,
        );

      if (token) {
        await logoutRequest();
      }
    } finally {
      clearAuthenticationState();

      setUser(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Context value
  |--------------------------------------------------------------------------
  */

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

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

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