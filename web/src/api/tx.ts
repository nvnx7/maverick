import {
  type Config,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { networkConfig } from "@/config/network";

/**
 * Arc confirms in well under a second, but the round trip through the wallet and back
 * is what actually sets the pace, so this is deliberately generous — a receipt that
 * arrives late is still a success, while a spurious timeout reports a confirmed
 * transaction as failed.
 */
const RECEIPT_TIMEOUT_MS = 120_000;
const RECEIPT_POLL_MS = 1_000;

type WriteRequest = Parameters<typeof writeContract>[1];
type Receipt = Awaited<ReturnType<typeof waitForTransactionReceipt>>;

/**
 * Sends a contract write through the wallet, then waits for the receipt on *our* RPC.
 *
 * Deliberately not `writeContractSync`: that waits via the connector client, so receipt
 * polling goes through whatever endpoint the wallet has configured for the chain, and it
 * derives its timeout from `chain.blockTime` — which viem's arcTestnet definition omits,
 * collapsing the budget to a 5s floor. Between the two, transactions that confirmed fine
 * surfaced to the user as WaitForTransactionReceiptTimeoutError.
 *
 * Splitting the two lets the wallet do what only it can (sign and broadcast) while
 * confirmation runs against the endpoint in config/network, on a timeout we control.
 *
 * Reverts throw: wagmi re-runs the call to decode a reason and raises it, so a returned
 * receipt always means the transaction succeeded.
 */
export async function writeAndWait(
  config: Config,
  request: WriteRequest,
): Promise<Receipt> {
  const hash = await writeContract(config, request);

  return waitForTransactionReceipt(config, {
    hash,
    chainId: networkConfig.chain.id,
    timeout: RECEIPT_TIMEOUT_MS,
    pollingInterval: RECEIPT_POLL_MS,
  });
}
