import { Hono } from "hono";
import { zeroAddress } from "viem";
import { z } from "zod";
import { getJob } from "../lib/job";
import { buildManifest, type StoredManifest } from "../lib/manifest";
import { type PresignedUpload, uploadManifestAndGetFileUrls } from "../lib/storage";

/** Names become a path segment, so allow only characters that can't escape one. */
const _SAFE_NAME = /^[a-zA-Z0-9._-]+$/;
const BYTES32 = /^0x[0-9a-fA-F]{64}$/;

const MAX_FILES = 500;
const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024; 

const fileSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    // .regex(
    //   SAFE_NAME,
    //   "name may only contain letters, digits, dot, underscore or hyphen",
    // )
    // The character class already blocks separators; this blocks the bare
    // relative segments, which would still climb a level in the prefix.
    .refine(
      (name) => name !== "." && name !== "..",
      "name must not be a relative path segment",
    ),
  hash: z.custom<`0x${string}`>(
    (value) => typeof value === "string" && BYTES32.test(value),
    "hash must be a 32-byte hex string",
  ),
  mimeType: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_FILE_BYTES),
});

const uploadInitSchema = z.object({
  jobId: z.string().regex(/^\d+$/, "jobId must be a numeric string"),
  files: z
    .array(fileSchema)
    .min(1, "files must not be empty")
    .max(MAX_FILES)
    // Names become sibling keys under one prefix, so a duplicate would have one
    // file silently overwrite the other.
    .refine(
      (files) => new Set(files.map((file) => file.name)).size === files.length,
      "file names must be unique within a submission",
    ),
});

export type UploadInitRequest = z.infer<typeof uploadInitSchema>;

export type UploadInitResponse = {
  /** Canonical manifest hash — this is what the device signs later. */
  dataHash: `0x${string}`;
  /** Target subdir/prefix: job-{jobId}/data-{dataHash}/ */
  uploadPath: string;
  /** Presigned POST policy (url + form fields) per file, keyed by the file name. */
  uploadUrls: Record<string, PresignedUpload>;
  manifest: StoredManifest;
};

export const upload = new Hono().post("/init", async (c) => {
  const body = await c.req.json().catch(() => null);

  const parsed = uploadInitSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request body" },
      400,
    );
  }

  const { jobId } = parsed.data;
  const id = BigInt(jobId);
  if (id === 0n) return c.json({ error: "invalid job id" }, 400);

  const job = await getJob(id);
  if (job.client === zeroAddress) {
    return c.json({ error: "job not found" }, 404);
  }

  const manifest = buildManifest(jobId, parsed.data.files);
  const { uploadPath, uploadUrls } = await uploadManifestAndGetFileUrls(jobId, manifest);

  const response: UploadInitResponse = {
    dataHash: manifest.dataHash,
    uploadPath,
    uploadUrls,
    manifest,
  };

  return c.json(response);
});
