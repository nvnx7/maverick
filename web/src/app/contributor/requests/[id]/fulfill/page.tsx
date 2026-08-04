import { FulfillFlow } from "@/components/contributor/fulfill/FulfillFlow";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function FulfillRequestPage() {
  return (
    <WalletGate>
      <FulfillFlow />
    </WalletGate>
  );
}
