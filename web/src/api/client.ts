import axios from "axios";
import { apiEvaluator, apiProvider } from "@/config/env";

export const httpProvider = axios.create({
  baseURL: apiProvider,
});

export const httpEvaluator = axios.create({
  baseURL: apiEvaluator,
});

/** Resolves fixture data on a short delay while the backend is stubbed out. */
export function mock<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}
