"use client";

import { Button } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { useGetSubmissionFiles } from "@/api/submissions/getSubmissionFiles";

type Props = {
  jobId: string;
};

export function SubmissionDownloadButton({ jobId }: Props) {
  const { data: files, isPending } = useGetSubmissionFiles(jobId);

  const handleDownload = () => {
    if (!files) return;
    
    // Trigger download for each file
    files.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      // Depending on browser policies, opening multiple links may be blocked.
      // Usually target="_blank" combined with download attribute works better for multiple files.
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
      borderRadius="0"
      borderColor="border.DEFAULT"
      color="primary"
      onClick={handleDownload}
      disabled={isPending}
    >
      <LuDownload /> Download Files
    </Button>
  );
}
