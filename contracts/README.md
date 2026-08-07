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

Both deploy scripts stand up the full stack, wire it together, and write the
result to `deployments/<chainKey>.json`. They share everything via
`scripts/DeployBase.sol` and differ only in where the payment token comes from:

- `scripts/Deploy.s.sol` — takes USDC's address from `scripts/config.json`
- `scripts/DeployLocal.s.sol` — deploys a `MockUSDC` and mints 1,000,000 to each
  of anvil's ten dev accounts

```bash
# Local: a bare anvil, not a fork (see below).
cp .env.example .env    # DEPLOYER_PRIVATE_KEY: use one of anvil's printed dev keys
just dev-local          # starts anvil, deploys, keeps the chain up

# Arc testnet: expects USDC to already exist (see config.json).
cp .env.example .env    # RPC_ARC_TESTNET, DEPLOYER_PRIVATE_KEY
just deploy-arc
```

### Why local is not a fork of Arc

Forking drags the real chain's state onto anvil's well-known dev keys, and all of
it gets in the way:

- **EIP-7702 delegations.** Arc has Prague active and those keys are public, so
  every one of them is delegated upstream to a contract with no code. That makes
  `signer.code.length != 0`, so OpenZeppelin's `SignatureChecker` takes the
  ERC-1271 branch instead of ECDSA and rejects every valid buyer signature.
- **Nonces in the thousands.** `CREATE` addresses derive from `(deployer, nonce)`,
  so every fresh fork deployed to different addresses.
- **`eth_getLogs` caps.** Anvil forwards pre-fork ranges upstream, where Arc
  refuses spans wider than ~20k blocks — so `fromBlock: 0` fails outright.

A bare node has none of that, and the only thing it lacks is USDC — which is why
`DeployLocal` mints one. Addresses are then reproducible across runs.

### Chain parameters

| Parameter         | `local`                    | `arcTestnet`             |
| ----------------- | -------------------------- | ------------------------ |
| `usdc`            | deployed `MockUSDC`        | `0x3600…0000` (Arc USDC) |
| `platformFeeBps`  | `250`                      | `250`                    |
| `evaluatorFeeBps` | `500`                      | `500`                    |

Edit `scripts/config.json` to override, or add a new chain key there and pass it
as `Deploy`'s `chainKey` argument.

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
