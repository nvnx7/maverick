import { PageHeader } from "@/components/common/PageHeader";
import { MySubmissionsTable } from "@/components/contributor/MySubmissionsTable";
import { SubmissionsEarnings } from "@/components/contributor/SubmissionsEarnings";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function MySubmissionsPage() {
  return (
    <>
      <PageHeader
        title="Your submissions"
        description="Payout timing is the provider's discretion, not enforced by the protocol. Verified work can sit before it's paid."
      />

      <WalletGate>
        <SubmissionsEarnings />
        <MySubmissionsTable />
      </WalletGate>
    </>
  );
}
