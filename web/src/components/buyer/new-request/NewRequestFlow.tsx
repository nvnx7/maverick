"use client";

import { NewRequestProvider } from "./NewRequestContext";
import { NewRequestSteps } from "./NewRequestSteps";

export function NewRequestFlow() {
  return (
    <NewRequestProvider>
      <NewRequestSteps />
    </NewRequestProvider>
  );
}
