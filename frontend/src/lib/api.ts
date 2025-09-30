// frontend/src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
console.log("[api] BASE_URL =", BASE_URL);

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${BASE_URL}${path}`;
  console.log("[api] →", options.method || "GET", url);

  const res = await fetch(url, { ...options, headers, cache: "no-store" });

  console.log("[api] ←", res.status, res.statusText, url);

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    console.error("[api] ERROR:", message);
    throw new Error(message);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
