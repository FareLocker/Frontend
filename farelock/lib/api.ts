const API_URL = process.env.API_URL ?? "http:localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${path} failed (${res.status})`);
  return res.json();
}


export const toCents = (dollars: string | number) => Math.round(Number(dollars) * 10);
