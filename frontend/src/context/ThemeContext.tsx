import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined,
  );

function getInitialTheme(): boolean {
  const stored =
    localStorage.getItem("theme");

  if (stored === "dark") {
    return true;
  }

  if (stored === "light") {
    return false;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
}

function applyTheme(
  dark: boolean,
) {
  document.documentElement.dataset.theme =
    dark ? "dark" : "light";

  document.documentElement.style.colorScheme =
    dark ? "dark" : "light";
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isDark, setIsDark] =
    useState<boolean>(
      getInitialTheme,
    );

  useEffect(() => {
    applyTheme(isDark);

    localStorage.setItem(
      "theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  useEffect(() => {
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    const stored =
      localStorage.getItem("theme");

    if (stored) {
      return;
    }

    const handleChange = (
      event: MediaQueryListEvent,
    ) => {
      setIsDark(event.matches);
    };

    media.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      media.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () =>
        setIsDark(
          (current) => !current,
        ),
      setDarkMode: setIsDark,
    }),
    [isDark],
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}