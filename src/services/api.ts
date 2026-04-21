import type {ApiResponse,ApiError}  from "../types/apiTypes";
const BASE_URL = import.meta.env.VITE_API_URL;

const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};
const clearAuth = () => {
  document.cookie = "access_token=; Max-Age=0; path=/";
  document.cookie = "refresh_token=; Max-Age=0; path=/";
};
const safeJson = async (res: Response) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};




const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const res = await fetch(
      `${BASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: "omit",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.msg || "Refresh token request failed");
    }

    if (!data?.access_token) {
      throw new Error("No access token returned from refresh");
    }

 
    document.cookie = `access_token=${data.access_token}; path=/`;

    return data.access_token;
  } catch (error) {
    console.error("refreshAccessToken error:", error);

   clearAuth();

    throw error; 
  }
};
const request = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getCookie("access_token");

  const makeRequest = async (accessToken?: string) => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_API_KEY,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      credentials: "omit",
    });
  };

  let res = await makeRequest(token);

 
  if (res.status === 401 || res.status === 403) {
    try {
      const newToken = await refreshAccessToken();
      res = await makeRequest(newToken);
    } catch (err: unknown) {
      document.cookie = "access_token=; Max-Age=0";
      document.cookie = "refresh_token=; Max-Age=0";

      window.location.href = "/login";

      if (err instanceof Error) {
        throw err;
      }

      throw new Error("Unknown refresh error");
    }
  }

  const data = await safeJson(res);

 if (!res.ok) {
    const err = new Error(
      data?.msg || data?.message || "API error"
    ) as ApiError;  // cast to ApiError

    err.response = {
      status: res.status,
      data,
    };

    throw err;
  }

  return {
    data,
    headers: res.headers,
  };
};

export const api = {
  get: <T = unknown>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),

  put: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(data) }),

  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),

  delete: <T = unknown>(url: string) =>
    request<T>(url, { method: "DELETE" }),
}