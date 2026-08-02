// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "erc-8183/contracts/mocks/MockUSDC.sol";

abstract contract Fixtures is Test {
    address internal admin = makeAddr("admin");
    address internal treasury = makeAddr("treasury");
    address internal stranger = makeAddr("stranger");

    /// @dev Relay the entrypoint's role-gated calls. Distinct from the agent contracts,
    ///      which hold the on-chain provider/evaluator seats.
    address internal providerOperator = makeAddr("providerOperator");
    address internal evaluatorOperator = makeAddr("evaluatorOperator");

    /// @dev The buyer signs job creation, so it needs a key rather than a label.
    uint256 internal buyerPk = 0xB0B;
    address internal buyer = vm.addr(0xB0B);

    uint256 internal constant BUDGET = 1_000e6;
    uint256 internal constant PLATFORM_FEE_BPS = 250;
    uint256 internal constant EVALUATOR_FEE_BPS = 500;
    uint48 internal constant JOB_DURATION = 7 days;
    uint256 internal constant AUTH_WINDOW = 1 hours;
    uint256 internal constant NONEXISTENT_JOB_ID = type(uint256).max;

    /// @dev Allowlisted on the escrow at setup — the budget token for every job.
    MockUSDC internal paymentToken = new MockUSDC();
    /// @dev Never allowlisted, for PaymentTokenNotAllowed coverage.
    MockUSDC internal notAllowedToken = new MockUSDC();

    function platformFee(uint256 amount) internal pure returns (uint256) {
        return (amount * PLATFORM_FEE_BPS) / 10000;
    }

    function evaluatorFee(uint256 amount) internal pure returns (uint256) {
        return (amount * EVALUATOR_FEE_BPS) / 10000;
    }

    function providerNet(uint256 amount) internal pure returns (uint256) {
        return amount - platformFee(amount) - evaluatorFee(amount);
    }
}
