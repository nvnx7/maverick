import { RequestDeclineNotice } from "@/components/buyer/RequestDeclineNotice";
import { RequestDetailHeader } from "@/components/buyer/RequestDetailHeader";
import { RequestOnChainFacts } from "@/components/buyer/RequestOnChainFacts";
import { RequestProviderReview } from "@/components/buyer/RequestProviderReview";
import { RequestStatusPanel } from "@/components/buyer/RequestStatusPanel";
import { RequestSubmissions } from "@/components/buyer/RequestSubmissions";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function RequestDetailPage() {
  return (
    <WalletGate>
      <RequestDetailHeader />
      <RequestDeclineNotice />
      {/* These two are mutually exclusive: the review panel owns Open (where the buyer
          still has an action), the status panel owns every state after it. */}
      <RequestProviderReview />
      <RequestStatusPanel />
      <RequestOnChainFacts />
      <RequestSubmissions />
    </WalletGate>
  );
}
