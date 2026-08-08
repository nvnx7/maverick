import { useQuery } from "@tanstack/react-query";
import { httpProvider } from "../client";

export type PresignedDownload = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

export function useGetSubmissionFiles(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-files", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const res = await httpProvider.get(`/jobs/${jobId}/files`);
      return (res.data?.files || []) as PresignedDownload[];
    },
    enabled: Boolean(jobId),
  });
}
