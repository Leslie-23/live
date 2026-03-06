const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ── Types ──────────────────────────────────────────────────────────────────────

export type User = {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  birthDate?: string;
  gender?: string;
  personalityBaseline?: {
    traits: string[];
    humorStyle: string;
    communicationStyle: string;
  };
  onboardingComplete: boolean;
};

type Ok<T> = { data: T; error: null };
type Err = { data: null; error: string };
type Result<T> = Promise<Ok<T> | Err>;

// ── Token injection ────────────────────────────────────────────────────────────

let _token: string | null = null;
export function setApiToken(token: string | null) {
  _token = token;
}

// ── Core request ──────────────────────────────────────────────────────────────

async function req<T>(path: string, init: RequestInit = {}): Result<T> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((_token ? { Authorization: `Bearer ${_token}` } : {}) as Record<string, string>),
      ...(init.headers as Record<string, string>),
    };
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.message ?? "Request failed" };
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "Network error. Check your connection." };
  }
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      req<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    register: (body: { fullName: string; email: string; password: string }) =>
      req<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    me: () => req<User>("/auth/me"),
  },

  onboarding: {
    complete: (body: {
      username: string;
      birthDate: string;
      gender: string;
      traits: string[];
      humorStyle: string;
      communicationStyle: string;
    }) =>
      req<User>("/users/onboarding", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  recordings: {
    upload: (formData: FormData) =>
      req<{ _id: string }>("/recordings/upload", {
        method: "POST",
        body: formData,
        headers: {},          // let fetch set multipart boundary
      }),
  },
};
