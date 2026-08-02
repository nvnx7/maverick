// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseAgent} from "./BaseAgent.sol";

/// @notice Holds the `evaluator` seat on every job created through DataCommerce.
/// @dev Accrues the escrow's evaluator fee; sweep it out via the entrypoint.
contract EvaluatorAgent is BaseAgent {
    constructor(address escrow_, address entrypoint_) BaseAgent(escrow_, entrypoint_) {}
}
