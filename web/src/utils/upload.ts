/** Stub — no real object storage yet. */
export async function uploadToS3(
  files: File[],
  uploadPath: string,
): Promise<void> {
  console.log(
    `[stub] uploadToS3 -> ${uploadPath}`,
    files.map((file) => file.name),
  );
}
