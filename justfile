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

# Start a local anvil fork of Arc testnet, on anvil's own default chain id (31337)
start-local:
    cd contracts && bun run fork:local

# Deploy the contracts to the local anvil fork (anvil must already be running)
deploy-local:
    cd contracts && bun run deploy:local

# Start the local anvil fork and deploy the contracts
dev-local:
    #!/usr/bin/env bash
    set -euo pipefail
    cd contracts && bun run fork:local &
    trap 'kill %1' EXIT
    until curl -s -o /dev/null -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://localhost:8545; do
      sleep 0.5
    done
    cd contracts && bun run deploy:local
    wait
