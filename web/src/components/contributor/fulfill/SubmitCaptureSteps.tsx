"use client";

import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
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

type Phase = "idle" | "provisioning" | "uploading" | "claiming";

const PHASE_LABEL: Record<Exclude<Phase, "idle">, string> = {
  provisioning: "Provisioning upload",
  uploading: "Uploading",
  claiming: "Submitting claim",
};

export function SubmitCaptureSteps() {
  const requestId = useRequestId();
  const router = useRouter();
  const { address } = useAccount();
  const { device, ready } = useDevice();
  const { files, setUploadTarget, setUploaded, setDataHash, setSignature } =
    useFulfill();
  const initUpload = useInitUpload();
  const submitCapture = useSubmitCapture();

  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [resultHash, setResultHash] = useState<string | null>(null);
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

  async function handleStartUpload() {
    if (!device || !address) return;
    setError(null);
    setUploadedCount(0);

    try {
      setPhase("provisioning");
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
      setResultHash(result.dataHash);
      setSignature(sig);
      setUploadTarget({
        uploadPath: result.uploadPath,
        uploadUrls: result.uploadUrls,
      });

      setPhase("uploading");
      for (const file of files) {
        const presigned = result.uploadUrls[file.name];
        if (!presigned) throw new Error(`No upload URL for ${file.name}`);
        await uploadFileToS3(file, presigned);
        setUploadedCount((count) => count + 1);
      }
      setUploaded(true);

      setPhase("claiming");
      await submitCapture.mutateAsync({
        jobId: requestId,
        deviceId: device.deviceId,
        dataHash: result.dataHash,
        signature: sig,
        payoutAddress: address,
        dataRef: result.uploadPath,
      });

      router.push(routes.contributor.submissions(requestId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setPhase("idle");
    }
  }

  const busy = phase !== "idle";

  return (
    <Panel>
      <Heading textStyle="body-md" fontWeight="600" color="primary" mb={4}>
        Submit
      </Heading>

      {files.length === 0 ? (
        <Box py={8} textAlign="center">
          <Text fontWeight="500" color="fg.muted" mb={1}>
            No files selected
          </Text>
          <Text fontSize="sm" color="fg.subtle">
            Select files above to continue.
          </Text>
        </Box>
      ) : (
        <Box>
          {resultHash && (
            <Box
              borderWidth="1px"
              borderColor="border.DEFAULT"
              bg="surfaceNeutral"
              p={4}
              mb={4}
            >
              <Text
                fontSize="xs"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
              >
                Data hash
              </Text>
              <CopyableHash value={resultHash} lead={18} tail={12} />
            </Box>
          )}

          <HStack gap={4}>
            <Button
              colorPalette="brand"
              onClick={handleStartUpload}
              loading={busy}
              loadingText={busy ? PHASE_LABEL[phase] : undefined}
            >
              Start Uploading
            </Button>
            {phase === "uploading" && (
              <Mono fontSize="sm" color="fg.muted">
                {uploadedCount}/{files.length} uploaded
              </Mono>
            )}
          </HStack>
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
