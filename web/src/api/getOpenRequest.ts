import { useQuery } from "@tanstack/react-query";
import { openRequests } from "@/mocks/data";
import type { OpenRequest } from "@/types";
import { mock } from "./client";

export function getOpenRequest(id: string): Promise<OpenRequest | null> {
  return mock(openRequests.find((item) => item.id === id) ?? null);
}

export function useGetOpenRequest(id?: string) {
  return useQuery({
    queryKey: ["open-request", id],
    queryFn: () => getOpenRequest(id as string),
    enabled: Boolean(id),
  });
}
