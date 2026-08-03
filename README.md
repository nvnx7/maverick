# Maverick

Maverick is a decentralized protocol for procuring on-demand AI training data with cryptographic provenance. Every capture is signed by a contributor's device the moment it's recorded. Provider and Evaluator agents independently verify the authenticity of requests and data before any payment moves. Settlement runs on Arc USDC rails through ERC-8183 — buyer funds sit in the protocol and release automatically in rolling batches to contributors as each submission is verified.

## Progress Update

| Module                    | Status      | Description                                                                                           |
| ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| [`contracts/`](contracts) | Done        | Solidity escrow (ERC-8183) plus on-chain Provider/Evaluator agent contracts (Foundry).                |
| [`sdk/`](sdk)             | Done        | TypeScript client wrapping contract calls, ABIs, and job types shared across apps.                    |
| [`provider/`](provider)   | Done        | Hono service that reviews and services jobs on behalf of a data provider.                             |
| [`evaluator/`](evaluator) | In progress | Hono service that verifies submissions before payout; being extended with AI-agent-driven evaluation. |
| [`web/`](web)             | In progress | Next.js frontend for buyers and contributors.                                                         |

## Modules

Flat Bun/Turborepo workspace, packages named `@repo/*`. See [SPEC.md](SPEC.md) for the full protocol spec.

### `contracts`

Foundry project holding the on-chain protocol: `DataCommerce.sol` (the ERC-8183 escrow entrypoint), `FundDisburser.sol`, and the `ProviderAgent` / `EvaluatorAgent` seat contracts under `src/agents/`.

```bash
cd contracts
forge build
forge test
forge fmt
```

### `sdk`

`@repo/sdk` — the shared TypeScript client: generated ABIs, typed contract wrappers (`src/contracts/`), and job types/utils consumed by `provider`, `evaluator`, and `web`. Built with `tsc`, no runtime of its own.

```bash
cd sdk
bun run build          # tsc -> dist/
bun run check-types
```

Rebuild after touching contract ABIs so downstream apps pick up the types (`bun run build` at the repo root does this first, via Turbo's `^build` dependency).

### `provider`

Hono service acting as the provider's operator: reviews jobs and drives the `ProviderAgent` contract through the SDK. Entrypoint at `src/index.ts`, routes in `src/routes/`, review logic in `src/lib/review.ts`.

```bash
cd provider
# .env needs: RPC_ARC_TESTNET, PROVIDER_OPERATOR_PRIVATE_KEY,
# ADDRESS_PROVIDER, ADDRESS_EVALUATOR, ADDRESS_DATA_COMMERCE (see src/config/env.ts)
bun run dev            # watch mode
bun run start
```

### `evaluator`

Hono service that will verify submissions before payout, driving the `EvaluatorAgent` contract. Currently just the app/route scaffold (`src/app.ts`, `src/routes/health.ts`) — job review and the AI-agent evaluation logic are the next things to land here, mirroring `provider`'s shape.

```bash
cd evaluator
bun run dev
bun run start
```

### `web`

Next.js (App Router) frontend for buyers and contributors, using `@repo/sdk` for contract reads/writes. Currently the default scaffold under `src/app/` — no product UI yet.

```bash
cd web
bun run dev            # next dev
bun run build
```

### `config`

Not an app — shared `tsconfig.base.json` and `biome.json` that every other workspace extends. No dev workflow of its own.

## Getting started

Requires [Bun](https://bun.com) >= 1.3.6 and [Foundry](https://book.getfoundry.sh/) for the contracts.

```bash
bun install

bun run dev          # run all apps (via Turborepo)
bun run build
bun run test
bun run check-types
bun run check         # biome lint + format
```

Each backend app (`provider`, `evaluator`) needs its own `.env` — see the module sections above for the required variables.
