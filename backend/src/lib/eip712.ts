export const submissionDomain = {
  name: "ProvenanceEscrow",
  version: "1",
  chainId: 5042002,
} as const;

export const submissionTypes = {
  Submission: [
    { name: "specId", type: "string" },
    { name: "deviceId", type: "string" },
    { name: "dataHash", type: "bytes32" },
    { name: "timestamp", type: "uint256" },
    { name: "payoutAddress", type: "address" },
  ],
} as const;
