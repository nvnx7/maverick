"use client";

import { Box, Button, HStack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useInitUpload, useSubmitCapture } from "@/api/submissions";
import { CopyableHash } from "@/components/common/CopyableHash";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { routes } from "@/config/routes";
import { useDevice } from "@/hooks/useDevice";
import { useRequestId } from "@/hooks/useRequestId";
import { signSubmission } from "@/utils/device";
import { hashFile } from "@/utils/hash";
import { uploadFileToS3 } from "@/utils/upload";
import { useFulfill } from "./FulfillContext";

export function SubmitCaptureSteps() {
  const requestId = useRequestId();
  const router = useRouter();
  const { address } = useAccount();
  const { device, ready } = useDevice();
  const {
    files,
    uploadTarget,
    dataHash,
    signature,
    setUploadTarget,
    setUploaded,
    setDataHash,
    setSignature,
  } = useFulfill();
  const initUpload = useInitUpload();
  const submitCapture = useSubmitCapture();

  const [requestingReview, setRequestingReview] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "uploading" | "claiming"
  >("idle");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (ready && !device) {
    return (
      <Panel>
        <Text fontWeight="500" mb={2}>
          This device has no signing key yet
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={5}>
          Captures are signed locally before submission. Set the device up once,
          then come back.
        </Text>
        <Button asChild colorPalette="brand" size="sm">
          <NextLink href={routes.contributor.device}>
            Set up this device
          </NextLink>
        </Button>
      </Panel>
    );
  }

  async function handleRequestReview() {
    if (!device || !address) return;
    setError(null);
    setRequestingReview(true);
    try {
      const fileMetas = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          hash: await hashFile(file),
          mimeType: file.type,
          size: file.size,
        })),
      );
      const result = await initUpload.mutateAsync({
        jobId: requestId,
        files: fileMetas,
      });
      const sig = await signSubmission(device, {
        dataHash: result.dataHash,
        timestamp: Math.floor(Date.now() / 1000),
        payoutAddress: address,
      });
      setDataHash(result.dataHash);
      setSignature(sig);
      setUploadTarget({
        uploadPath: result.uploadPath,
        uploadUrls: result.uploadUrls,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Review request failed.",
      );
    } finally {
      setRequestingReview(false);
    }
  }

  async function handleUploadFiles() {
    if (!uploadTarget || !device || !dataHash || !signature || !address) {
      return;
    }
    setError(null);
    setSubmitPhase("uploading");
    setUploadedCount(0);
    try {
      for (const file of files) {
        const presigned = uploadTarget.uploadUrls[file.name];
        if (!presigned) throw new Error(`No upload URL for ${file.name}`);
        await uploadFileToS3(file, presigned);
        setUploadedCount((count) => count + 1);
      }
      setUploaded(true);
      setSubmitPhase("claiming");
      await submitCapture.mutateAsync({
        jobId: requestId,
        deviceId: device.deviceId,
        dataHash,
        signature,
        payoutAddress: address,
        dataRef: uploadTarget.uploadPath,
      });
      router.push(routes.contributor.submissions(requestId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setSubmitPhase("idle");
    }
  }

  const isSubmitting = submitPhase !== "idle" || submitCapture.isPending;
  const submitLoadingText =
    submitPhase === "claiming" || submitCapture.isPending
      ? "Submitting claim"
      : "Uploading";

  return (
    <Panel>
      {files.length === 0 ? (
        <Text fontSize="sm" color="fg.subtle">
          Select files above to continue.
        </Text>
      ) : (
        <Box>
          {dataHash && (
            <Box mb={4}>
              <CopyableHash value={dataHash} lead={18} tail={12} />
            </Box>
          )}

          {uploadTarget ? (
            <HStack gap={4}>
              <Button
                colorPalette="brand"
                onClick={handleUploadFiles}
                loading={isSubmitting}
                loadingText={submitLoadingText}
              >
                Upload files
              </Button>
              {submitPhase === "uploading" && (
                <Mono fontSize="sm" color="fg.muted">
                  {uploadedCount}/{files.length} uploaded
                </Mono>
              )}
            </HStack>
          ) : (
            <Button
              colorPalette="brand"
              onClick={handleRequestReview}
              loading={requestingReview}
              loadingText="Requesting review"
            >
              Request review before upload
            </Button>
          )}

          {uploadTarget && (
            <Mono fontSize="xs" color="fg.muted" mt={3} wordBreak="break-all">
              {uploadTarget.uploadPath}
            </Mono>
          )}
        </Box>
      )}

      {(error || submitCapture.isError) && (
        <Text fontSize="sm" color="warn.fg" mt={5}>
          {error ?? submitCapture.error?.message}
        </Text>
      )}
    </Panel>
  );
}
