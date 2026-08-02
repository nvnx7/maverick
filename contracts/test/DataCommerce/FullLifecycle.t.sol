// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

/// @dev Integration paths only; per-action validation lives in the sibling files.
contract FullLifecycleTest is BaseTest {
    function test_happyPath_createFundSubmitComplete() public {
        uint256 jobId = _createJob();
        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Open));

        _fund(jobId, BUDGET);
        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Funded));

        _submit(jobId);
        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Submitted));

        _complete(jobId);
        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));

        vm.prank(admin);
        dc.sweepAgentBalances(address(paymentToken));
        assertEq(paymentToken.balanceOf(treasury), BUDGET);
    }

    function test_rejectionPath_refundsBuyer() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobId, bytes32("bad spec"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(buyer), BUDGET);
        assertEq(paymentToken.balanceOf(treasury), 0);
    }

    function test_expiryPath_refundsBuyer() public {
        uint256 jobId = _createFundedJob();
        vm.warp(expiredAt);

        escrow.claimRefund(jobId);

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(buyer), BUDGET);
    }

    function test_buyerNeverInteractsWithTheEntrypoint() public {
        uint256 jobId = _createFundedJob();
        _submit(jobId);
        _complete(jobId);

        // The buyer only ever signs once and calls the escrow to fund.
        assertEq(paymentToken.balanceOf(address(dc)), 0);
        assertEq(paymentToken.allowance(buyer, address(dc)), 0);
    }

    function test_concurrentJobsSettleIndependently() public {
        uint256 jobA = _createFundedJob();
        uint256 jobB = _createFundedJob();

        _submit(jobA);
        _complete(jobA);

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobB, bytes32("bad spec"));

        assertEq(uint8(dc.getJob(jobA).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(uint8(dc.getJob(jobB).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(buyer), BUDGET, "only jobB refunded");
    }
}
