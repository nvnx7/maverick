// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseTest} from "./fixtures/BaseTest.sol";

/// @dev The escrow pays the evaluator fee to job.evaluator, which here is a keyless agent
///      rather than an operator key. These pin that routing and the sweep back to treasury.
contract FeesTest is BaseTest {
    function test_evaluatorFeeAccruesToAgentNotOperator() public {
        _complete(_createSubmittedJob());

        assertEq(paymentToken.balanceOf(address(evaluatorAgent)), evaluatorFee(BUDGET));
        assertEq(paymentToken.balanceOf(evaluatorOperator), 0, "no operator key can hold the fee");
    }

    function test_platformFeeAndNetGoToTreasury() public {
        _complete(_createSubmittedJob());

        assertEq(paymentToken.balanceOf(treasury), platformFee(BUDGET) + providerNet(BUDGET));
    }

    function test_entrypointAndProviderAgentHoldNothing() public {
        _complete(_createSubmittedJob());

        assertEq(paymentToken.balanceOf(address(dc)), 0);
        assertEq(paymentToken.balanceOf(address(providerAgent)), 0);
    }

    function test_sweepMovesEvaluatorFeeToTreasury() public {
        _complete(_createSubmittedJob());

        vm.prank(admin);
        dc.sweepAgentBalances(address(paymentToken));

        assertEq(paymentToken.balanceOf(address(evaluatorAgent)), 0);
        assertEq(paymentToken.balanceOf(treasury), BUDGET, "whole budget ends at treasury");
    }

    function test_sweepAccumulatesAcrossJobs() public {
        _complete(_createSubmittedJob());
        _complete(_createSubmittedJob());

        assertEq(paymentToken.balanceOf(address(evaluatorAgent)), evaluatorFee(BUDGET) * 2);

        vm.prank(admin);
        dc.sweepAgentBalances(address(paymentToken));

        assertEq(paymentToken.balanceOf(treasury), BUDGET * 2);
    }

    function test_escrowIsDrainedAfterCompletion() public {
        _complete(_createSubmittedJob());
        assertEq(paymentToken.balanceOf(address(escrow)), 0);
    }
}
