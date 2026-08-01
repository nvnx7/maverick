import { isAddress, isHex } from "viem";
import { z } from "zod";

export const submitCaptureSchema = z.object({
  deviceId: z.string().min(1),
  dataRef: z.string().min(1),
  dataHash: z
    .string()
    .refine((v): v is `0x${string}` => isHex(v) && v.length === 66),
  timestamp: z.number().int(),
  payoutAddress: z.string().refine((v): v is `0x${string}` => isAddress(v)),
  signature: z.string().refine((v): v is `0x${string}` => isHex(v)),
  metadata: z
    .record(z.string(), z.unknown())
    .refine((m) => Object.keys(m).length > 0),
});

export type SubmitCaptureRequest = z.infer<typeof submitCaptureSchema>;
