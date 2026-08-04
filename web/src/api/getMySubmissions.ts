import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { submissions } from "@/mocks/data";
import type { Submission } from "@/types";
import { mock } from "./client";

export function getMySubmissions(
  _payoutAddress: Address,
): Promise<Submission[]> {
  return mock([...submissions].sort((a, b) => b.submittedAt - a.submittedAt));
}

export function useGetMySubmissions(payoutAddress?: Address) {
  return useQuery({
    queryKey: ["my-submissions", payoutAddress],
    queryFn: () => getMySubmissions(payoutAddress as Address),
    enabled: Boolean(payoutAddress),
  });
}
