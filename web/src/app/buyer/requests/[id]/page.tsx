import { RequestDeclineNotice } from "@/components/buyer/RequestDeclineNotice";
import { RequestDetailHeader } from "@/components/buyer/RequestDetailHeader";
import { RequestOnChainFacts } from "@/components/buyer/RequestOnChainFacts";
import { RequestProviderReview } from "@/components/buyer/RequestProviderReview";
import { RequestSubmissionsTable } from "@/components/buyer/RequestSubmissionsTable";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function RequestDetailPage() {
  return (
    <WalletGate>
      <RequestDetailHeader />
      <RequestDeclineNotice />
      <RequestProviderReview />
      <RequestOnChainFacts />
      <RequestSubmissionsTable />
    </WalletGate>
  );
}
