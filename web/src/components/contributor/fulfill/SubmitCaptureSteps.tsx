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
      <Panel p={8}>
        <Text textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
          Device Signing Key Required
        </Text>
        <Text fontSize="14px" color="fg.muted" mb={5}>
          Captures are signed locally by your hardware enclave before
          submission. Please set up your device first to generate a keypair.
        </Text>
        <Button
          asChild
          bg="primary"
          color="onPrimary"
          borderRadius="0"
          px={6}
          py={5}
          fontSize="sm"
          fontWeight="600"
          _hover={{
            bg: "onSurfaceVariant",
            transform: "translate(-2px, -2px)",
            boxShadow: "4px 4px 0px 0px #000",
          }}
        >
          <NextLink href={routes.contributor.device}>
            Set Up Device Key
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
    <Panel p={8}>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={4}>
        Submit Signed Dataset Captures
      </Heading>

      {files.length === 0 ? (
        <Box
          py={8}
          textAlign="center"
          border="1px solid"
          borderColor="border.chrome"
          bg="surfaceNeutral"
        >
          <Text fontWeight="700" color="primary" mb={1}>
            No Files Selected
          </Text>
          <Text fontSize="14px" color="fg.subtle">
            Drop or select files above to initiate hardware signing and
            submission.
          </Text>
        </Box>
      ) : (
        <Box>
          {resultHash && (
            <Box
              border="1px solid"
              borderColor="primary"
              bg="surfaceNeutral"
              p={4}
              mb={4}
            >
              <Text
                textStyle="label-mono"
                fontSize="10px"
                color="fg.subtle"
                fontWeight="700"
                mb={2}
              >
                PROVENANCE DATA HASH
              </Text>
              <CopyableHash value={resultHash} lead={18} tail={12} />
            </Box>
          )}

          <HStack gap={4}>
            <Button
              bg="primary"
              color="onPrimary"
              borderRadius="0"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="600"
              onClick={handleStartUpload}
              loading={busy}
              loadingText={busy ? PHASE_LABEL[phase] : undefined}
              _hover={{
                bg: "onSurfaceVariant",
                transform: "translate(-2px, -2px)",
                boxShadow: "4px 4px 0px 0px #000",
              }}
            >
              Start Uploading
            </Button>
            {phase === "uploading" && (
              <Mono fontSize="13px" color="primary" fontWeight="700">
                {uploadedCount}/{files.length} files uploaded
              </Mono>
            )}
          </HStack>
        </Box>
      )}

      {(error || submitCapture.isError) && (
        <Text fontSize="14px" color="red.600" fontWeight="600" mt={5}>
          {error ?? submitCapture.error?.message}
        </Text>
      )}
    </Panel>
  );
}
