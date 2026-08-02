// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseAgent} from "./BaseAgent.sol";

/// @notice Holds the `provider` seat on every job created through DataCommerce.
contract ProviderAgent is BaseAgent {
    constructor(address escrow_, address entrypoint_) BaseAgent(escrow_, entrypoint_) {}
}
