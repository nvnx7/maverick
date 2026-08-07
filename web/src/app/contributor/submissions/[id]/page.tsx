import { ContributorClaimsTable } from "@/components/contributor/ContributorClaimsTable";
import { SubmissionsPageHeader } from "@/components/contributor/SubmissionsPageHeader";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function ContributorSubmissionsPage() {
  return (
    <WalletGate>
      <SubmissionsPageHeader />
      <ContributorClaimsTable />
    </WalletGate>
  );
}
