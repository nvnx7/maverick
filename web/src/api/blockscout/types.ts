/** Etherscan-compatible `module=logs&action=getLogs` response shape. */
export type BlockscoutLog = {
  address: string;
  topics: (string | null)[];
  data: string;
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
};

export type BlockscoutLogsResponse = {
  status: string;
  message: string;
  result: BlockscoutLog[];
};
