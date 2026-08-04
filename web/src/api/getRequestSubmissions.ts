import { useQuery } from "@tanstack/react-query";
import { requestSubmissions } from "@/mocks/data";
import type { Submission } from "@/types";
import { mock } from "./client";

export function getRequestSubmissions(id: string): Promise<Submission[]> {
  return mock(requestSubmissions[id] ?? []);
}

export function useGetRequestSubmissions(id?: string) {
  return useQuery({
    queryKey: ["request-submissions", id],
    queryFn: () => getRequestSubmissions(id as string),
    enabled: Boolean(id),
  });
}
