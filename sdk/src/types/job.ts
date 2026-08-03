/** Job lifecycle states, matching ERC8183.JobStatus ordinals. */
export enum JobStatus {
  Open = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Rejected = 4,
  Expired = 5,
}

/** Mirrors ERC8183.Job, with the packed uint48 fields widened to bigint. */
export type Job = {
  client: `0x${string}`;
  status: JobStatus;
  provider: `0x${string}`;
  expiredAt: bigint;
  evaluator: `0x${string}`;
  submittedAt: bigint;
  budget: bigint;
  hook: `0x${string}`;
  paymentToken: `0x${string}`;
  providerAgentId: bigint;
  description: string;
  settledAmount: bigint;
  payoutReceiver: `0x${string}`;
};

/** The shape viem decodes from `getJob`, before widening. */
export type RawJob = {
  client: `0x${string}`;
  status: number;
  provider: `0x${string}`;
  expiredAt: number;
  evaluator: `0x${string}`;
  submittedAt: number;
  budget: bigint;
  hook: `0x${string}`;
  paymentToken: `0x${string}`;
  providerAgentId: bigint;
  description: string;
  settledAmount: bigint;
  payoutReceiver: `0x${string}`;
};
