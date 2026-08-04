import { useQuery } from "@tanstack/react-query";
import { buildRequestDetail, buyerRequests } from "@/mocks/data";
import type { RequestDetail } from "@/types";
import { mock } from "./client";

export function getRequest(id: string): Promise<RequestDetail | null> {
  const request = buyerRequests.find((item) => item.id === id);
  return mock(request ? buildRequestDetail(request) : null);
}

export function useGetRequest(id?: string) {
  return useQuery({
    queryKey: ["request", id],
    queryFn: () => getRequest(id as string),
    enabled: Boolean(id),
  });
}
