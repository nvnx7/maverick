import { PageHeader } from "@/components/common/PageHeader";
import { DeviceSetupPanel } from "@/components/contributor/DeviceSetupPanel";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function DeviceSetupPage() {
  return (
    <>
      <PageHeader
        title="Device setup"
        description="A one-time step. Without a signing key on this device you can't submit captures."
      />

      <WalletGate>
        <DeviceSetupPanel />
      </WalletGate>
    </>
  );
}
