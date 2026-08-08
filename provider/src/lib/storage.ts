import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  s3AccessKeyId,
  s3BucketName,
  s3EndpointUrl,
  s3SecretAccessKey,
} from "../config/env";
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

export async function uploadManifestAndGetFileUrls(
  jobId: string,
  manifest: StoredManifest,
): Promise<{
  uploadPath: string;
  uploadUrls: Record<string, PresignedUpload>;
}> {
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

export type PresignedDownload = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

export async function getFileDownloadUrls(
  jobId: string,
  manifest: StoredManifest,
): Promise<PresignedDownload[]> {
  const path = `job-${jobId}/data-${manifest.dataHash}`;

  const downloads = await Promise.all(
    manifest.files.map(async (file) => {
      const command = new GetObjectCommand({
        Bucket: s3BucketName,
        Key: `${path}/${file.name}`,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return {
        name: file.name,
        url,
        mimeType: file.mimeType,
        size: file.size,
      };
    }),
  );

  return downloads;
}

export async function getJobFiles(jobId: string): Promise<PresignedDownload[]> {
  const prefix = `job-${jobId}/`;

  const result = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: s3BucketName,
      Prefix: prefix,
    }),
  );

  if (!result.Contents) return [];

  // Filter out manifest.json and anything that ends with /
  const files = result.Contents.filter(
    (obj) =>
      obj.Key && !obj.Key.endsWith("manifest.json") && !obj.Key.endsWith("/"),
  );

  const downloads = await Promise.all(
    files.map(async (file) => {
      const command = new GetObjectCommand({
        Bucket: s3BucketName,
        Key: file.Key,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      const fileName = file.Key!.split("/").pop() || file.Key!;
      let mimeType = "application/octet-stream";
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        mimeType = "image/jpeg";
      }

      return {
        name: fileName,
        url,
        mimeType,
        size: file.Size || 0,
      };
    }),
  );

  return downloads;
}
