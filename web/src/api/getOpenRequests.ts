import { useQuery } from "@tanstack/react-query";
import type { Modality } from "@/config/constants";
import { openRequests } from "@/mocks/data";
import type { OpenRequest } from "@/types";
import { mock } from "./client";

export function getOpenRequests(params: {
  modality?: Modality;
}): Promise<OpenRequest[]> {
  const { modality } = params;
  return mock(
    modality
      ? openRequests.filter((item) => item.spec.modality === modality)
      : openRequests,
  );
}

export function useGetOpenRequests(modality?: Modality) {
  return useQuery({
    queryKey: ["open-requests", modality ?? "all"],
    queryFn: () => getOpenRequests({ modality }),
  });
}
