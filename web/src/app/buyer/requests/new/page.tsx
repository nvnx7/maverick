import { NewRequestFlow } from "@/components/buyer/new-request/NewRequestFlow";
import { PageHeader } from "@/components/common/PageHeader";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        title="New request"
        description="Two transactions: one to create the request, one to fund it after the provider agrees."
      />

      <WalletGate>
        <NewRequestFlow />
      </WalletGate>
    </>
  );
}
