// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DeployBase} from "./DeployBase.sol";

/// @notice Deploys the stack against a chain that already has USDC, taking its address
///         from config.json.
/// @dev Run with `--sig "run(string)" "<chainKey>"`, picking the chainKey out of
///      config.json — chainid isn't reliable for this, since several chains can share
///      the local chain id. For a bare local node see DeployLocal, which mints its own.
contract Deploy is DeployBase {
    function run(string memory chainKey) external {
        ChainConfig memory config = _loadConfig(chainKey);

        vm.startBroadcast();
        Deployment memory deployment = _deployStack(config, msg.sender);
        vm.stopBroadcast();

        _saveDeployment(chainKey, deployment);
    }
}
