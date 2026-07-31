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
