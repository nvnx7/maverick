// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Holds an ERC-8183 actor seat on behalf of an entrypoint contract.
/// @dev Deliberately keyless and non-upgradeable: its address is written into every job it
///      participates in, so it must outlive any logic change. All calls are scoped to the
///      immutable escrow, bounding what a future entrypoint can do with it.
abstract contract BaseAgent {
    using SafeERC20 for IERC20;

    address public immutable escrow;
    address public entrypoint;

    event EntrypointUpdated(address indexed entrypoint);

    error NotEntrypoint();
    error ZeroAddress();

    constructor(address escrow_, address entrypoint_) {
        if (escrow_ == address(0) || entrypoint_ == address(0)) revert ZeroAddress();
        escrow = escrow_;
        entrypoint = entrypoint_;
        emit EntrypointUpdated(entrypoint_);
    }

    modifier onlyEntrypoint() {
        if (msg.sender != entrypoint) revert NotEntrypoint();
        _;
    }

    /// @notice Forwards a call to the escrow, acting as this agent.
    function execute(bytes calldata data) external onlyEntrypoint returns (bytes memory) {
        return Address.functionCall(escrow, data);
    }

    /// @notice Transfers tokens held by this agent, such as accrued evaluator fees.
    function sweep(address token, address to, uint256 amount) external onlyEntrypoint {
        IERC20(token).safeTransfer(to, amount);
    }

    /// @notice Hands control to a replacement entrypoint, preserving this agent's identity
    ///         so in-flight jobs remain driveable.
    function setEntrypoint(address entrypoint_) external onlyEntrypoint {
        if (entrypoint_ == address(0)) revert ZeroAddress();
        entrypoint = entrypoint_;
        emit EntrypointUpdated(entrypoint_);
    }
}
