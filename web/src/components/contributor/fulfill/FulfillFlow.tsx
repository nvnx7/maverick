"use client";

import { Box, Heading, Stack } from "@chakra-ui/react";
import { CaptureUploader } from "./CaptureUploader";
import { FulfillProvider } from "./FulfillContext";
import { FulfillRequestSummary } from "./FulfillRequestSummary";
import { SubmitCaptureSteps } from "./SubmitCaptureSteps";

export function FulfillFlow() {
  return (
    <FulfillProvider>
      <FulfillRequestSummary />

      <Stack gap={6}>
        <Box>
          <Heading size="sm" fontWeight="500" color="fg.muted" mb={4}>
            Your capture
          </Heading>
          <CaptureUploader />
        </Box>

        <SubmitCaptureSteps />
      </Stack>
    </FulfillProvider>
  );
}
