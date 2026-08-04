import axios from "axios";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROVIDER_URL ?? "http://localhost:3001",
  timeout: 15_000,
});

/** Resolves fixture data on a short delay while the backend is stubbed out. */
export function mock<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}
