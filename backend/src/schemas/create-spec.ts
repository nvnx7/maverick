import { isAddress } from "viem";
import { z } from "zod";
import { parseUsdcAmount } from "../lib/amount";
import { ApiError } from "../lib/errors";
import { MODALITIES } from "../types";

const usdcAmount = z.string().refine((v) => parseUsdcAmount(v) !== null, {
  params: { appCode: "invalid_amount" },
});

export const createSpecSchema = z
  .object({
    buyerAddress: z.string().refine((v): v is `0x${string}` => isAddress(v)),
    modality: z.enum(MODALITIES),
    deviceRequirements: z.string().min(1),
    pricePerItem: usdcAmount,
    totalBudget: usdcAmount,
  })
  .refine(
    (data) =>
      (parseUsdcAmount(data.totalBudget) ?? 0n) >=
      (parseUsdcAmount(data.pricePerItem) ?? 0n),
    { path: ["totalBudget"], params: { appCode: "budget_too_small" } },
  );

export type CreateSpecRequest = z.infer<typeof createSpecSchema>;

export function createSpecError(issue: z.ZodIssue): ApiError {
  const appCode =
    issue.code === "custom"
      ? (issue.params as { appCode?: string } | undefined)?.appCode
      : undefined;

  if (appCode === "budget_too_small") {
    return new ApiError(
      400,
      "budget_too_small",
      "totalBudget smaller than pricePerItem",
    );
  }
  if (appCode === "invalid_amount") {
    return new ApiError(
      400,
      "invalid_amount",
      "pricePerItem/totalBudget must be a valid positive decimal",
    );
  }
  if (issue.path[0] === "modality") {
    return new ApiError(
      400,
      "invalid_modality",
      `modality must be one of ${MODALITIES.join(", ")}`,
    );
  }
  return new ApiError(400, "bad_request", "missing or malformed field");
}
