"use client";

import { LuDownload } from "react-icons/lu";
import { useGetSubmissionFiles } from "@/api/submissions/getSubmissionFiles";
import { Button } from "@/components/common/Button";

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

