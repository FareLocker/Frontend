/*
 * Photon (Spectrum Cloud): the service that sends FareLocker's iMessages.
 *
 * When someone signs up with a phone number, the backend's Photon worker
 * (Backend/hacklanta/src/index.ts, enrollProjectUser) adds them to the Photon
 * project as a user, with their phone number AND email. It does not keep the
 * Photon user id it gets back, so to remove someone we look them up first.
 *
 * Server only: it reads PHOTON_PROJECT_ID / PHOTON_PROJECT_SECRET from the
 * environment (farelock/.env.local locally, the deploy's env in production).
 * Never import this from a "use client" file.
 *
 * Docs:
 *   list:   https://photon.codes/docs/api-reference/users/list-users
 *   delete: https://photon.codes/docs/api-reference/users/delete-user
 */

const PHOTON_API = "https://spectrum.photon.codes";

/** Photon can be slow; don't leave the member waiting on it for long. */
const TIMEOUT_MS = 10_000;

type PhotonUser = {
  id: string;
  email: string | null;
  phoneNumber: string | null;
};

type PhotonListResponse = {
  succeed: boolean;
  data: { users: PhotonUser[]; total: number };
};

function credentials(): { projectId: string; auth: string } | null {
  const projectId = process.env.PHOTON_PROJECT_ID;
  const secret = process.env.PHOTON_PROJECT_SECRET;
  if (!projectId || !secret) return null;
  return {
    projectId,
    // "Authorization: Basic base64(projectId:projectSecret)", per the docs.
    auth: `Basic ${Buffer.from(`${projectId}:${secret}`).toString("base64")}`,
  };
}

async function photon<T>(path: string, init: RequestInit, auth: string): Promise<T> {
  const res = await fetch(`${PHOTON_API}${path}`, {
    ...init,
    headers: { Authorization: auth, ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`Photon ${init.method ?? "GET"} ${path} failed (${res.status}) ${detail}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Removes a member from the Photon project, so FareLocker stops texting
 * them. Returns how many Photon users were removed (0 if they were never
 * enrolled, e.g. they signed up without a phone number).
 *
 * Photon's `search` is a partial, case-insensitive match on name, phone and
 * email, so its results are narrowed here to EXACT matches on the email (and
 * the phone number, if we have it). That way "ann@x.com" can never remove
 * "joann@x.com".
 *
 * Throws if Photon is not configured or answers with an error; the caller
 * decides whether that should stop the account deletion.
 */
export async function removePhotonUser(member: {
  email: string;
  /** E.164, e.g. "+14045551212". /auth/me doesn't send it yet; see below. */
  phoneNumber?: string | null;
}): Promise<number> {
  const creds = credentials();
  if (!creds) throw new Error("PHOTON_PROJECT_ID / PHOTON_PROJECT_SECRET are not set");
  const base = `/projects/${encodeURIComponent(creds.projectId)}/users/`;

  const email = member.email.trim().toLowerCase();
  const list = await photon<PhotonListResponse>(
    `${base}?${new URLSearchParams({ search: email })}`,
    { method: "GET" },
    creds.auth,
  );

  const matches = (list.data?.users ?? []).filter(
    (user) =>
      user.email?.trim().toLowerCase() === email ||
      (member.phoneNumber && user.phoneNumber === member.phoneNumber),
  );

  for (const user of matches) {
    await photon(`${base}${encodeURIComponent(user.id)}/`, { method: "DELETE" }, creds.auth);
  }
  return matches.length;
}
