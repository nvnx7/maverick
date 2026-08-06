#!/usr/bin/env bash
#
# Start a bare local anvil, deploy the contracts into it, then keep anvil in the
# foreground so the chain stays up for the app to talk to.
#
# Deliberately not a fork of Arc: forking drags the real chain's state onto anvil's
# well-known dev keys — EIP-7702 delegations that break signature checks, and nonces in
# the thousands that make CREATE addresses drift every run — and caps eth_getLogs ranges.
# A bare node has none of that; the only thing it lacks is USDC, which DeployLocal mints.
set -euo pipefail

RPC_URL="${RPC_URL:-http://localhost:8545}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() { printf 'error: %s\n' "$*" >&2; exit 1; }

# Refuse to run against a node we did not start: anvil would fail to bind and we would
# silently deploy into whatever stale chain is already on the port. A stale chain also
# means the deployer's nonce has moved, so the contracts would land on addresses that no
# longer match web/src/config/network.ts.
if lsof -nP -iTCP:8545 -sTCP:LISTEN >/dev/null 2>&1; then
  die "something is already listening on :8545 (a previous anvil?).
       stop it first — pkill -f anvil — or use 'just deploy-local' to
       deploy into the node that is already running."
fi

cd "$ROOT/contracts"

bun run chain:local &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" 2>/dev/null || true' EXIT

# Poll rather than sleep, and check the pid each round so a node that dies on startup
# surfaces as an error instead of hanging here forever.
until curl -s -o /dev/null -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    "$RPC_URL"; do
  kill -0 "$ANVIL_PID" 2>/dev/null || die "anvil exited before it was ready"
  sleep 0.5
done

bun run deploy:local

wait "$ANVIL_PID"
