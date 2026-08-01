import { Hono } from "hono";
import { ApiError, errorResponse } from "../lib/errors";
import { createSpecError, createSpecSchema } from "../schemas/create-spec";
import type { CreateSpecResponse } from "../types";
import { submitCapture } from "./submissions";

export const specs = new Hono()
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createSpecSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (!issue) {
        return errorResponse(
          c,
          new ApiError(400, "bad_request", "invalid request body"),
        );
      }
      return errorResponse(c, createSpecError(issue));
    }

    const { modality, pricePerItem, totalBudget } = parsed.data;

    // TODO: Circle Gateway payment middleware — 402 challenge on unpaid, treated as paid for now.
    // TODO: persist spec; flips to "active" only once SpecFunded is observed on-chain.
    const response: CreateSpecResponse = {
      specId: crypto.randomUUID(),
      status: "payment_verified_pending_settlement",
      modality,
      pricePerItem,
      totalBudget,
      remainingBudget: totalBudget,
    };

    return c.json(response, 201);
  })
  .post("/:id/submissions", submitCapture);
