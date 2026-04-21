import { useCallback } from "react";

type CookieOptions = {
  days?: number;
  path?: string;
  sameSite?: "Strict" | "Lax" | "None";
  secure?: boolean;
  expiresAt?: number; 
};

export const useCookie = () => {

const setCookie = useCallback(
  (name: string, value: string, options: CookieOptions = {}) => {
    const {
      days = 7,
      expiresAt,
      path = "/",
      sameSite = "Strict",
      secure = true,
    } = options;

    const expires = expiresAt
      ? new Date(expiresAt * 1000).toUTCString()
      : new Date(Date.now() + days * 864e5).toUTCString();

    document.cookie = `${name}=${value}; expires=${expires}; path=${path}; SameSite=${sameSite}; ${
      secure ? "Secure;" : ""
    }`;
  },
  []
);

  const getCookie = useCallback((name: string) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  }, []);

  const deleteCookie = useCallback((name: string, path = "/") => {
    document.cookie = `${name}=; Max-Age=0; path=${path}`;
  }, []);
  const clearAuth = () => {
  document.cookie = "access_token=; Max-Age=0; path=/";
  document.cookie = "refresh_token=; Max-Age=0; path=/";
};

  return { setCookie, getCookie, deleteCookie, clearAuth };
};