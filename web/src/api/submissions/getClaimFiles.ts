import { useQueries } from "@tanstack/react-query";
import type { Hash } from "viem";
import { httpProvider } from "../client";

export type PresignedDownload = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

/**
 * Files belonging to specific claimed submissions.
 *
 * Scoped per deliverable rather than per job on purpose: the provider's `/jobs/:id/files`
 * lists everything under the job's storage prefix, which includes captures that were
 * uploaded but never claimed on-chain. Driving previews off that made requests with no
 * submissions display images anyway. `/jobs/:id/claims/:dataHash/files` resolves the
 * manifest for one claim, so only genuinely submitted data can appear.
 */
export function useGetClaimFiles(params: {
  jobId?: string;
  dataHashes: Hash[];
}) {
  const { jobId, dataHashes } = params;

  return useQueries({
    queries: dataHashes.map((dataHash) => ({
      queryKey: ["claim-files", jobId, dataHash],
      queryFn: async (): Promise<PresignedDownload[]> => {
        const res = await httpProvider.get(
          `/jobs/${jobId}/claims/${dataHash}/files`,
        );
        return (res.data?.files ?? []) as PresignedDownload[];
      },
      enabled: Boolean(jobId),
      // Presigned URLs expire in an hour; refetching sooner just churns signatures.
      staleTime: 30 * 60_000,
    })),
    // `combine` keeps the flattened result referentially stable across renders, which a
    // useMemo over the query array cannot do — that array is a new identity every time.
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });
}
