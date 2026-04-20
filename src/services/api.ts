import type {ApiResponse,ApiError}  from "../types/apiTypes";
const BASE_URL = import.meta.env.VITE_API_URL;

const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

const safeJson = async (res: Response) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};




const refreshAccessToken = async () => {
  const refreshToken = getCookie("refresh_token");

  if (!refreshToken) throw new Error("No refresh token");

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

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();

  document.cookie = `access_token=${data.access_token}; path=/`;

  return data.access_token;
};

const request = async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse> => {
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
    const err: ApiError = new Error(
      data?.msg || data?.message || "API error"
    );

    err.response = {
      status: res.status,
      data,
    };

    throw err;
  }

  return data;
};


export const api = {
 get: (url: string, options?: RequestInit) => request(url, { ...options, method: "GET" }),

  post: (url: string, data?: unknown) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (url: string, data?: unknown) =>
    request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (url: string, data?: unknown) =>
    request(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (url: string) =>
    request(url, {
      method: "DELETE",
    }),
};