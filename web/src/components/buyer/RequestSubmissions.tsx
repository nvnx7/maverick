"use client";

import { useGetJob } from "@/api/jobs";
import { useRequestId } from "@/hooks/useRequestId";
import { JobStatus } from "@/types";
import { RequestSubmissionsTable } from "./RequestSubmissionsTable";

/**
 * Submissions can only exist once escrow is funded — the escrow rejects claims on an
 * Open job — so the table is hidden until then rather than rendering a permanently
 * empty "no submissions yet" block next to a request nobody can contribute to.
 */
const VISIBLE_FOR: JobStatus[] = [
  JobStatus.Funded,
  JobStatus.Submitted,
  JobStatus.Completed,
  JobStatus.Rejected,
  JobStatus.Expired,
];

export function RequestSubmissions() {
  const id = useRequestId();
  const { data } = useGetJob(id);

  if (!data || !VISIBLE_FOR.includes(data.status)) return null;

  return <RequestSubmissionsTable />;
}
