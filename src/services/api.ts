const BASE_URL = import.meta.env.VITE_API_URL;
const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};
const refreshAccessToken = async () => {
  const refreshToken = getCookie("refresh_token");

  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();

  document.cookie = `access_token=${data.access_token}; path=/`;

  return data.access_token;
};
const request = async (endpoint: string, options: RequestInit = {}) => {
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
      credentials: "include",
    });
  };

  let res = await makeRequest(token);

  // ✅ If token expired → try refresh
  if (res.status === 401 || res.status === 403) {
    try {
      const newToken = await refreshAccessToken();

      // retry with new token
      res = await makeRequest(newToken);
    } catch (err) {
      // ❌ refresh failed → logout user
      document.cookie = "access_token=; Max-Age=0";
      document.cookie = "refresh_token=; Max-Age=0";

      window.location.href = "/login";
      throw err;
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const err = new Error(
      error.msg || error.message || "API error"
    ) as unknown;

    err.response = { status: res.status, data: error };
    throw err;
  }

  return res.json();
};

export const api = {
  get: (url: string) => request(url),

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
