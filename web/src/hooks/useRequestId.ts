"use client";

import { useParams } from "next/navigation";

/** Route-derived id, read where it's needed instead of threaded through props. */
export function useRequestId(): string {
  const params = useParams<{ id: string }>();
  return params.id;
}
