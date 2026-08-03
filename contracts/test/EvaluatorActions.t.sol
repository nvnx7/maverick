// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

contract EvaluatorActionsTest is BaseTest {
    function test_completeJob_releasesEscrow() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(evaluatorOperator);
        dc.completeJob(jobId, bytes32("approved"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
    }

    function test_completeJob_revertsWhenNotSubmitted() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dc.completeJob(jobId, bytes32("approved"));
    }

    function test_completeJob_revertsForProviderRole() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(providerOperator);
        vm.expectRevert();
        dc.completeJob(jobId, bytes32("approved"));
    }

    function test_completeJob_revertsOnNonexistentJob() public {
        vm.prank(evaluatorOperator);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dc.completeJob(NONEXISTENT_JOB_ID, bytes32("approved"));
    }

    function test_rejectJob_refundsFundedJob() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobId, bytes32("bad spec"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(buyer), BUDGET);
    }

    function test_rejectJob_refundsSubmittedJob() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobId, bytes32("bad deliverable"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(buyer), BUDGET);
    }

    function test_rejectJob_revertsForProviderRole() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        vm.expectRevert();
        dc.rejectJob(jobId, bytes32("bad spec"));
    }

    function test_approveJobClaim_settlesMilestone() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 2;

        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, milestone, keccak256("milestone"));

        vm.prank(evaluatorOperator);
        dc.approveJobClaim(jobId, milestone, keccak256("milestone"));

        assertEq(dc.getJob(jobId).settledAmount, milestone);
        assertEq(paymentToken.balanceOf(treasury), platformFee(milestone) + providerNet(milestone));
        assertEq(paymentToken.balanceOf(address(evaluatorAgent)), evaluatorFee(milestone));
    }

    function test_approveJobClaim_revertsWithoutPendingClaim() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        vm.expectRevert(ERC8183.NoPendingClaim.selector);
        dc.approveJobClaim(jobId, BUDGET / 2, keccak256("milestone"));
    }

    function test_rejectJobClaim_clearsPendingClaim() public {
        uint256 jobId = _createFundedJob();
        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, BUDGET / 2, keccak256("milestone"));

        vm.prank(evaluatorOperator);
        dc.rejectJobClaim(jobId, BUDGET / 2, keccak256("milestone"), bytes32("rejected"));

        assertEq(escrow.pendingClaimHash(jobId), bytes32(0));
        assertEq(dc.getJob(jobId).settledAmount, 0);
    }

    function test_completeJob_paysOnlyRemainderAfterMilestone() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 2;

        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, milestone, keccak256("milestone"));
        vm.prank(evaluatorOperator);
        dc.approveJobClaim(jobId, milestone, keccak256("milestone"));

        _submit(jobId);
        vm.prank(evaluatorOperator);
        dc.completeJob(jobId, bytes32("approved"));

        // Both settlements together move the whole budget out of escrow.
        assertEq(paymentToken.balanceOf(address(escrow)), 0);
        assertEq(dc.getJob(jobId).settledAmount, milestone);
    }
}
