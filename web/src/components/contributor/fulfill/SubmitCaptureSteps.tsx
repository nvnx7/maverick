"use client";

import { Button, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useSubmitCapture } from "@/api/submitCapture";
import { CopyableHash } from "@/components/common/CopyableHash";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { routes } from "@/config/routes";
import { useDevice } from "@/hooks/useDevice";
import { useRequestId } from "@/hooks/useRequestId";
import { signSubmission } from "@/utils/device";
import { formatBytes } from "@/utils/format";
import { hashFiles } from "@/utils/hash";
import { useFulfill } from "./FulfillContext";
import { FulfillStep } from "./FulfillStep";

export function SubmitCaptureSteps() {
  const requestId = useRequestId();
  const router = useRouter();
  const { address } = useAccount();
  const { device, ready } = useDevice();
  const { files, dataHash, signature, setDataHash, setSignature } =
    useFulfill();
  const submitCapture = useSubmitCapture();

  const [hashing, setHashing] = useState(false);
  const [signing, setSigning] = useState(false);
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

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  async function handleHash() {
    setError(null);
    setHashing(true);
    try {
      setDataHash(await hashFiles(files));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hashing failed.");
    } finally {
      setHashing(false);
    }
  }

  async function handleSign() {
    if (!device || !dataHash || !address) return;
    setError(null);
    setSigning(true);
    try {
      setSignature(
        await signSubmission(device, {
          dataHash,
          timestamp: Math.floor(Date.now() / 1000),
          payoutAddress: address,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Signing failed.");
    } finally {
      setSigning(false);
    }
  }

  async function handleSubmit() {
    if (!device || !dataHash || !signature || !address) return;
    setError(null);
    await submitCapture.mutateAsync({
      jobId: requestId,
      deviceId: device.deviceId,
      dataHash,
      signature,
      payoutAddress: address,
      dataRef: `local:${files.length}-files`,
    });
    router.push(routes.contributor.submissions);
  }

  return (
    <Panel>
      <Stack gap={0}>
        <FulfillStep
          index={1}
          title="Hash your files locally"
          description="The hash is what your device signs. It's produced here, in this browser — the files aren't uploaded to compute it."
          done={Boolean(dataHash)}
        >
          {files.length === 0 ? (
            <Text fontSize="sm" color="fg.subtle">
              Select files above to continue.
            </Text>
          ) : dataHash ? (
            <CopyableHash value={dataHash} lead={18} tail={12} />
          ) : (
            <HStack gap={4}>
              <Button
                size="sm"
                colorPalette="brand"
                onClick={handleHash}
                loading={hashing}
                loadingText="Hashing files locally"
              >
                Hash {files.length} file{files.length === 1 ? "" : "s"}
              </Button>
              <Mono fontSize="xs" color="fg.muted">
                {formatBytes(totalBytes)}
              </Mono>
            </HStack>
          )}
        </FulfillStep>

        <FulfillStep
          index={2}
          title="Sign this submission with your device key"
          description="Your payout address is signed into the payload, so a valid submission can't be replayed against another wallet."
          done={Boolean(signature)}
        >
          {!dataHash ? (
            <Text fontSize="sm" color="fg.subtle">
              Hash your files first.
            </Text>
          ) : signature ? (
            <CopyableHash value={signature} lead={18} tail={12} />
          ) : (
            <Button
              size="sm"
              colorPalette="brand"
              onClick={handleSign}
              loading={signing}
              loadingText="Signing"
            >
              Sign submission
            </Button>
          )}
        </FulfillStep>

        <FulfillStep
          index={3}
          title="Submit"
          description="The evaluator checks your signature against the on-chain device registry before anything is paid."
        >
          {!signature ? (
            <Text fontSize="sm" color="fg.subtle">
              Sign the submission first.
            </Text>
          ) : (
            <HStack gap={4}>
              <Button
                size="sm"
                colorPalette="brand"
                onClick={handleSubmit}
                loading={submitCapture.isPending}
                loadingText="Submitting"
              >
                Submit capture
              </Button>
              {submitCapture.isPending && <Spinner size="xs" />}
            </HStack>
          )}
        </FulfillStep>
      </Stack>

      {(error || submitCapture.isError) && (
        <Text fontSize="sm" color="warn.fg" mt={5}>
          {error ?? submitCapture.error?.message}
        </Text>
      )}
    </Panel>
  );
}
