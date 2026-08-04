import axios from "axios";
import { apiProvider } from "@/config/env";

export const http = axios.create({
  baseURL: apiProvider,
  timeout: 15_000,
});

/** Resolves fixture data on a short delay while the backend is stubbed out. */
export function mock<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}
