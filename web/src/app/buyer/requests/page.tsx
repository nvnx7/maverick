import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { BuyerRequestsTable } from "@/components/buyer/BuyerRequestsTable";
import { PageHeader } from "@/components/common/PageHeader";
import { WalletGate } from "@/components/wallet/WalletGate";
import { routes } from "@/config/routes";

export default function BuyerDashboardPage() {
  return (
    <>
      <PageHeader
        title="Your requests"
        description="Every request you've posted, with the status the contract reports for it."
      >
        <Button asChild colorPalette="brand" size="sm">
          <NextLink href={routes.buyer.newRequest}>New request</NextLink>
        </Button>
      </PageHeader>

      <WalletGate>
        <BuyerRequestsTable />
      </WalletGate>
    </>
  );
}
