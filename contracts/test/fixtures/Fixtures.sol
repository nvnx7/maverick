// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "erc8183/contracts/mocks/MockUSDC.sol";
import {MockFeeOnTransferToken} from "erc8183/contracts/mocks/MockFeeOnTransferToken.sol";

abstract contract Fixtures is Test {
    address internal admin = makeAddr("admin");
    address internal treasury = makeAddr("treasury");
    address internal client = makeAddr("client");
    address internal provider = makeAddr("provider");
    address internal evaluator = makeAddr("evaluator");
    address internal notAdmin = makeAddr("notAdmin");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 internal constant EVALUATOR_FEE_BPS = 100; // 1%
    uint256 internal constant JOB_BUDGET = 1_000e6; // 1,000 USDC
    uint48 internal constant JOB_DURATION = 7 days;
    uint256 internal constant NONEXISTENT_JOB_ID = type(uint256).max;

    /// @dev Allowlisted at init — the "normal" payment token for happy-path flows.
    MockUSDC internal paymentToken = new MockUSDC();
    /// @dev Never allowlisted — for PaymentTokenNotAllowed coverage.
    MockUSDC internal notAllowedToken = new MockUSDC();
    /// @dev Burns 1% per transfer — for UnexpectedFundedAmount coverage in fund().
    MockFeeOnTransferToken internal feeOnTransferToken = new MockFeeOnTransferToken();
}
