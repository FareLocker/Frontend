const API_URL = process.env.API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: number,
    public readonly detail: unknown,
  ) {
    super(`API ${path} failed (${status})`);
  }
}

async function readErrorDetail(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return res.text();

  try {
    const body = await res.json();
    return body.detail ?? body;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(path, res.status, await readErrorDetail(res));
  return res.json();
}


export const toCents = (dollars: string | number) => Math.round(Number(dollars) * 100);
