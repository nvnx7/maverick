import type {
  Account,
  Address,
  Chain,
  Hash,
  PublicClient,
  WalletClient,
} from "viem";
import { type DataCommerceContract, getDataCommerce } from "../contracts";
import type { Job } from "../types/job";
import { normalizeJob } from "../utils/job";

export type DataCommerceClientConfig = {
  address: Address;
  publicClient: PublicClient;
  /** Required for writes; omit for a read-only client. */
  walletClient?: WalletClient;
  /** Defaults to the wallet client's own account. */
  account?: Account;
};

type Clients = { public: PublicClient; wallet: WalletClient };
type WriteOptions = { account: Account; chain: Chain | undefined };

/** Typed reader/writer for a DataCommerce deployment. */
export class DataCommerceClient {
  readonly address: Address;

  private readonly contract: DataCommerceContract<Clients>;
  private readonly walletClient?: WalletClient;
  private readonly account?: Account;

  constructor({
    address,
    publicClient,
    walletClient,
    account,
  }: DataCommerceClientConfig) {
    this.address = address;
    this.walletClient = walletClient;
    this.account = account ?? walletClient?.account;

    // viem only surfaces `write` when the wallet is non-optional in the type, and only
    // attaches it at runtime when the wallet is actually present. Asserting the
    // write-capable shape keeps one instance; `requireWrite` guards the absent case.
    this.contract = getDataCommerce(address, {
      public: publicClient,
      wallet: walletClient,
    } as Clients);
  }

  /** True when this client was constructed with a wallet and can send transactions. */
  get canWrite(): boolean {
    return this.walletClient !== undefined && this.account !== undefined;
  }

  // ──────────────────── Reads ────────────────────

  async getJob(jobId: bigint): Promise<Job> {
    return normalizeJob(await this.contract.read.getJob([jobId]));
  }

  treasury(): Promise<Address> {
    return this.contract.read.treasury();
  }

  payoutToken(): Promise<Address> {
    return this.contract.read.payoutToken();
  }

  providerAgent(): Promise<Address> {
    return this.contract.read.providerAgent();
  }

  evaluatorAgent(): Promise<Address> {
    return this.contract.read.evaluatorAgent();
  }

  commerce(): Promise<Address> {
    return this.contract.read.commerce();
  }

  // ──────────────────── Provider actions ────────────────────

  setJobBudget(jobId: bigint, budget: bigint): Promise<Hash> {
    return this.requireWrite().setJobBudget([jobId, budget], this.options());
  }

  submitJob(jobId: bigint, deliverable: Hash): Promise<Hash> {
    return this.requireWrite().submitJob([jobId, deliverable], this.options());
  }

  submitJobClaim(
    jobId: bigint,
    cumulativeAmount: bigint,
    deliverable: Hash,
  ): Promise<Hash> {
    return this.requireWrite().submitJobClaim(
      [jobId, cumulativeAmount, deliverable],
      this.options(),
    );
  }

  withdrawJobClaim(
    jobId: bigint,
    cumulativeAmount: bigint,
    deliverable: Hash,
    reason: Hash,
  ): Promise<Hash> {
    return this.requireWrite().withdrawJobClaim(
      [jobId, cumulativeAmount, deliverable, reason],
      this.options(),
    );
  }

  rejectOpenJob(jobId: bigint, reason: Hash): Promise<Hash> {
    return this.requireWrite().rejectOpenJob([jobId, reason], this.options());
  }

  // ──────────────────── Evaluator actions ────────────────────

  completeJob(jobId: bigint, reason: Hash): Promise<Hash> {
    return this.requireWrite().completeJob([jobId, reason], this.options());
  }

  rejectJob(jobId: bigint, reason: Hash): Promise<Hash> {
    return this.requireWrite().rejectJob([jobId, reason], this.options());
  }

  approveJobClaim(
    jobId: bigint,
    cumulativeAmount: bigint,
    deliverable: Hash,
  ): Promise<Hash> {
    return this.requireWrite().approveJobClaim(
      [jobId, cumulativeAmount, deliverable],
      this.options(),
    );
  }

  rejectJobClaim(
    jobId: bigint,
    cumulativeAmount: bigint,
    deliverable: Hash,
    reason: Hash,
  ): Promise<Hash> {
    return this.requireWrite().rejectJobClaim(
      [jobId, cumulativeAmount, deliverable, reason],
      this.options(),
    );
  }

  // ──────────────────── Admin ────────────────────

  sweepAgentBalances(token: Address): Promise<Hash> {
    return this.requireWrite().sweepAgentBalances([token], this.options());
  }

  /** Guards the absent-wallet case before viem's `write` proxy is touched. */
  private requireWrite(): DataCommerceContract<Clients>["write"] {
    if (!this.walletClient) {
      throw new Error(
        "DataCommerceClient: a walletClient is required for writes",
      );
    }
    return this.contract.write;
  }

  private options(): WriteOptions {
    if (!this.account) {
      throw new Error("DataCommerceClient: no account configured for writes");
    }
    return { account: this.account, chain: this.walletClient?.chain };
  }
}
