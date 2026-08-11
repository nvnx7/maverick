"use client";

import { LuDownload } from "react-icons/lu";
import type { Hash } from "viem";
import { useGetClaimFiles } from "@/api/submissions/getClaimFiles";
import { Button } from "@/components/common/Button";

type Props = {
  jobId: string;
  /** Deliverables of claims actually submitted on-chain for this job. */
  dataHashes: Hash[];
};

export function SubmissionDownloadButton({ jobId, dataHashes }: Props) {
  const { data: files, isPending } = useGetClaimFiles({ jobId, dataHashes });

  const handleDownload = () => {
    if (!files) return;

    // Trigger download for each file
    files.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  if (!files || files.length === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      px={4}
      py={2}
      onClick={handleDownload}
      disabled={isPending}
    >
      <LuDownload /> Download Files
    </Button>
  );
}
