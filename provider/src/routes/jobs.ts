import { Hono } from "hono";

const notImplemented = {
  error: "not implemented",
  code: "not_implemented",
} as const;

export const jobs = new Hono()
  // Validates the job against the escrow and this application's rules, reporting whether
  // it is legitimate and its budget should be set.
  .get("/:id/status", (c) => {
    return c.json(notImplemented, 501);
  })
  // Sends the setBudget transaction through the ProviderAgent for a validated job.
  .post("/:id/activate", (c) => {
    return c.json(notImplemented, 501);
  });
