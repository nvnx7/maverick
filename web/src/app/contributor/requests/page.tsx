import { PageHeader } from "@/components/common/PageHeader";
import { BrowseRequests } from "@/components/contributor/BrowseRequests";

export default function BrowseRequestsPage() {
  return (
    <>
      <PageHeader
        title="Open requests"
        description="Funded requests you can submit against. Price per item is what you earn per accepted capture."
      />

      <BrowseRequests />
    </>
  );
}
