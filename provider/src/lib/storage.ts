import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3AccessKeyId, s3BucketName, s3EndpointUrl, s3SecretAccessKey } from "../config/env";
import type { StoredManifest } from "./manifest";

// Bun's built-in S3Client only presigns single-URL requests (query-string SigV4) — it
// has no concept of a POST policy's Conditions/Fields, so the AWS SDK is needed for
// createPresignedPost specifically. Region is "auto": Railway's endpoint accepts it and
// it's what Bun's client was already signing with.
const s3Client = new S3Client({
  region: "auto",
  endpoint: s3EndpointUrl,
  forcePathStyle: true,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
});

export type PresignedUpload = {
  url: string;
  fields: Record<string, string>;
};

async function uploadJsonToS3(key: string, data: unknown): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    }),
  );
}

export async function uploadManifestAndGetFileUrls(
  jobId: string,
  manifest: StoredManifest,
): Promise<{ uploadPath: string; uploadUrls: Record<string, PresignedUpload> }> {
  const path = `job-${jobId}/data-${manifest.dataHash}`;

  const uploadUrls: Record<string, PresignedUpload> = {};
  for (const file of manifest.files) {
    uploadUrls[file.name] = await createPresignedPost(s3Client, {
      Bucket: s3BucketName,
      Key: `${path}/${file.name}`,
      Expires: 2 * 60 * 60,
      Conditions: [
        ["eq", "$Content-Type", file.mimeType],
        ["content-length-range", file.size, file.size],
      ],
      Fields: {
        "Content-Type": file.mimeType,
      },
    });
  }

  await uploadJsonToS3(`${path}/manifest.json`, manifest);

  return { uploadPath: path, uploadUrls };
}
