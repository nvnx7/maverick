export type SpecPayload = {
  modality: string;
  deviceRequirements: string;
  minItems: number;
};

/**
 * `job.description` is unconstrained on-chain, so parse defensively.
 * Never throws; extra keys are ignored rather than rejected.
 */
export function parseSpecPayload(raw: string): SpecPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as Record<string, unknown>;

  if (typeof o.modality !== "string") return null;
  if (
    typeof o.deviceRequirements !== "string" ||
    o.deviceRequirements.length > 500
  ) {
    return null;
  }
  if (
    typeof o.minItems !== "number" ||
    !Number.isInteger(o.minItems) ||
    o.minItems < 1 ||
    o.minItems > 100_000
  ) {
    return null;
  }

  return {
    modality: o.modality,
    deviceRequirements: o.deviceRequirements,
    minItems: o.minItems,
  };
}
