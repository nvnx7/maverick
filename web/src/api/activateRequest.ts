import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RequestStatusReport } from "@/types";
import { mock } from "./client";
import { getRequestStatus } from "./getRequestStatus";

/** POST /jobs/:id/activate — asks the provider to act on its review. */
export function activateRequest(id: string): Promise<RequestStatusReport> {
  return mock(null, 800).then(() => getRequestStatus(id));
}

export function useActivateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateRequest,
    onSuccess: (report) => {
      queryClient.setQueryData(["request-status", report.jobId], report);
    },
  });
}
