"use client";

import { Heading, Stack } from "@chakra-ui/react";
import { CaptureUploader } from "./CaptureUploader";
import { FulfillProvider } from "./FulfillContext";
import { FulfillRequestSummary } from "./FulfillRequestSummary";
import { Panel } from "@/components/common/Panel";
import { SubmitCaptureSteps } from "./SubmitCaptureSteps";

export function FulfillFlow() {
  return (
    <FulfillProvider>
      <FulfillRequestSummary />

      <Stack gap={6}>
        <Panel>
          <Heading textStyle="body-md" fontWeight="600" color="primary" mb={4}>
            Your capture
          </Heading>
          <CaptureUploader />
        </Panel>

        <SubmitCaptureSteps />
      </Stack>
    </FulfillProvider>
  );
}

