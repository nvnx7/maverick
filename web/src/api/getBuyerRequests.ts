import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { buyerRequests } from "@/mocks/data";
import type { BuyerRequest } from "@/types";
import { mock } from "./client";

export function getBuyerRequests(_buyer: Address): Promise<BuyerRequest[]> {
  return mock([...buyerRequests].sort((a, b) => b.createdAt - a.createdAt));
}

export function useGetBuyerRequests(buyer?: Address) {
  return useQuery({
    queryKey: ["buyer-requests", buyer],
    queryFn: () => getBuyerRequests(buyer as Address),
    enabled: Boolean(buyer),
  });
}
