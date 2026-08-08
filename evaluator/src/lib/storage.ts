import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  s3AccessKeyId,
  s3BucketName,
  s3EndpointUrl,
  s3SecretAccessKey,
} from "../config/env";
import type { StoredManifest } from "./manifest";

// Same S3 bucket as the provider — the evaluator reads manifests written there
// but never presigns uploads itself.
const s3Client = new S3Client({
  region: "auto",
  endpoint: s3EndpointUrl,
  forcePathStyle: true,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
});

export async function getStoredManifest(
  jobId: string,
  dataHash: `0x${string}`,
): Promise<StoredManifest | null> {
  const key = `job-${jobId}/data-${dataHash}/manifest.json`;

  try {
    const result = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3BucketName,
        Key: key,
      }),
    );
    const raw = await result.Body?.transformToString();
    return raw ? (JSON.parse(raw) as StoredManifest) : null;
  } catch (cause) {
    if (
      cause &&
      typeof cause === "object" &&
      "name" in cause &&
      (cause.name === "NoSuchKey" || cause.name === "NotFound")
    ) {
      return null;
    }
    throw cause;
  }
}
