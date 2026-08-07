import { useMutation } from "@tanstack/react-query";
import type { Hash } from "viem";
import { http } from "../client";

type InitUploadFile = {
  name: string;
  hash: Hash;
  mimeType: string;
  size: number;
};

export type InitUploadParams = {
  jobId: string;
  files: InitUploadFile[];
};

export type PresignedUpload = {
  url: string;
  fields: Record<string, string>;
};

export type InitUploadResult = {
  dataHash: Hash;
  uploadPath: string;
  /** Presigned POST policy (url + form fields) per file, keyed by file name. */
  uploadUrls: Record<string, PresignedUpload>;
  manifest: unknown;
};

export async function initUpload(
  params: InitUploadParams,
): Promise<InitUploadResult> {
  const { data } = await http.post<InitUploadResult>("/upload/init", params);
  return data;
}

export function useInitUpload() {
  return useMutation({ mutationFn: initUpload });
}
