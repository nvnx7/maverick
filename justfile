# ── Top-level commands ──────────────────────────────────────────────────

# Build all JS/TS workspaces via Turbo
build:
    bun run build

# ── Contracts ───────────────────────────────────────────────────────────

# Build the Solidity contracts (Foundry)
build-contracts:
    cd contracts && forge build

# Run the contracts test suite (Foundry)
test-contracts:
    cd contracts && forge test

# Start a bare local anvil on chain id 31337
start-local:
    cd contracts && bun run chain:local

# Deploy the contracts + a MockUSDC locally (anvil must already be running)
deploy-local:
    cd contracts && bun run deploy:local

# Deploy the contracts to Arc testnet, against Arc's own USDC
deploy-arc:
    cd contracts && bun run deploy:arc

# Start a bare local anvil and deploy into it, then keep anvil running
dev-local:
    ./scripts/dev-local.sh
