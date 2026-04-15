const BASE_URL = import.meta.env.VITE_API_URL
const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

const request = async (
  endpoint: string,
  options: RequestInit = {}
) => {
   const token = getCookie("access_token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_API_KEY,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  })

if (!res.ok) {
  const error = await res.json().catch(() => ({}))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = new Error(error.msg || error.message || 'API error') as any
  err.response = { status: res.status, data: error } 
  throw err
}

  return res.json()
}


export const api = {
  get: (url: string) => request(url),

  post: (url: string, data?: unknown) =>
    request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (url: string, data?:unknown) =>
    request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: (url: string, data?: unknown) =>
    request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (url: string) =>
    request(url, {
      method: 'DELETE',
    }),
}