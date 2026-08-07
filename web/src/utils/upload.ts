import type { PresignedUpload } from "@/api/submissions";

export async function uploadFileToS3(
  file: File,
  presigned: PresignedUpload,
): Promise<void> {
  const form = new FormData();
  for (const [key, value] of Object.entries(presigned.fields)) {
    form.append(key, value);
  }
  form.append("file", file);

  const res = await fetch(presigned.url, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed for ${file.name}: ${res.status}`);
  }
}
