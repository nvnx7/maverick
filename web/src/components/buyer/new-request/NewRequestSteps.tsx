"use client";

import { FundRequestStep } from "./FundRequestStep";
import { useNewRequest } from "./NewRequestContext";
import { NewRequestForm } from "./NewRequestForm";
import { ProviderReviewStep } from "./ProviderReviewStep";
import { RequestFundedSummary } from "./RequestFundedSummary";

export function NewRequestSteps() {
  const { stage } = useNewRequest();

  switch (stage) {
    case "form":
      return <NewRequestForm />;
    case "review":
      return <ProviderReviewStep />;
    case "fund":
      return <FundRequestStep />;
    case "funded":
      return <RequestFundedSummary />;
  }
}
