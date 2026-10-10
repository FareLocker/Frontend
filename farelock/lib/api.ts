const API_URL = process.env.API_URL ?? "http://localhost:8000";

/** A non-2xx answer from the backend, with its status and FastAPI `detail`. */
export class ApiError extends Error {
  constructor(
    path: string,
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`API ${path} failed (${status})`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(path, res.status, body?.detail);
  }
  return res.json();
}


export const toCents = (dollars: string | number) => Math.round(Number(dollars) * 100);
