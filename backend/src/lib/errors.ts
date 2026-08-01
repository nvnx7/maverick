import type { Context } from "hono";

export type ErrorCode =
  | "bad_request"
  | "invalid_modality"
  | "invalid_amount"
  | "budget_too_small"
  | "spec_not_found";

export class ApiError extends Error {
  constructor(
    public readonly status: 400 | 404,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function errorResponse(c: Context, err: ApiError) {
  return c.json({ error: err.message, code: err.code }, err.status);
}
