# @repo/contracts

Solidity for the Maverick protocol. **Foundry compiles, tests, and deploys.**

- `src/DataCommerce.sol` — the entrypoint, UUPS-upgradeable, role-gated
- `src/agents/` — `ProviderAgent` / `EvaluatorAgent`, the ERC-8183 actor seats
- `src/FundDisburser.sol` — payout receiver that forwards to a contributor
- `src/deploy/Externals.sol` — import-only, so `forge build` emits artifacts for
  `ERC1967Proxy` and `MockUSDC`

## Build and test

```bash
forge build
forge test
forge build --sizes   # EIP-170 check
```

## Deploy

`scripts/Deploy.s.sol` is a Foundry script that deploys the full stack, wires it
together, and writes the result to `deployments/<chainKey>.json`. Per-chain
parameters (payment token, fees) live in `scripts/config.json`.

```bash
# Local: forks Arc testnet, so USDC and friends already exist in state.
anvil --fork-url https://rpc.testnet.arc.network --code-size-limit 60000
bun run deploy:local

# Arc testnet: expects USDC to already exist (see config.json).
cp .env.example .env    # RPC_ARC_TESTNET, DEPLOYER_PRIVATE_KEY
bun run deploy:arc
```

### Chain parameters

| Parameter         | Default                                      |
| ----------------- | --------------------------------------------- |
| `usdc`            | `0x3600…0000` (Arc USDC) for both chain keys |
| `platformFeeBps`  | `250`                                        |
| `evaluatorFeeBps` | `500`                                        |

Edit `scripts/config.json` to override, or add a new chain key there and pass it
as the script's `chainKey` argument.

### Roles

Account 0 deploys and is left holding admin, treasury, and both operator seats.
That is forced, not stylistic: `setAgents` and the escrow's fee/allowlist setters
are admin-gated and the deploy script sends them from the deploying account, so
the deployer must hold admin for the length of the run. Hand roles over afterwards:

```solidity
dataCommerce.grantRole(PROVIDER_ROLE, providerOperator);
dataCommerce.grantRole(EVALUATOR_ROLE, evaluatorOperator);
escrow.setPlatformFee(platformFeeBps, realTreasury);
```

## Known blocker: escrow exceeds EIP-170

`ERC8183WithAuthorization` compiles to **27,574 bytes**, about 3KB over the
24,576-byte contract size limit. No compiler setting closes the gap — via-IR with
`optimizer_runs = 1` still lands at 25,776. It therefore cannot deploy to a chain
that enforces EIP-170, including Arc testnet.

Local deployment works because `anvil --code-size-limit 60000` lifts the check.
Deploying for real needs the contract itself made smaller (splitting the
authorization entrypoints into a library or a separate contract), which lives in
`erc-8183/base-contracts`, not here.
