// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract ProviderActionsTest is BaseTest {
    function test_setJobBudget_updatesWhileOpen() public {
        uint256 jobId = _createJob();

        vm.prank(providerOperator);
        dc.setJobBudget(jobId, BUDGET * 2);

        assertEq(dc.getJob(jobId).budget, BUDGET * 2);
    }

    function test_setJobBudget_revertsOnceFunded() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dc.setJobBudget(jobId, BUDGET * 2);
    }

    function test_setJobBudget_revertsForNonProviderRole() public {
        uint256 jobId = _createJob();

        vm.prank(stranger);
        vm.expectRevert();
        dc.setJobBudget(jobId, BUDGET * 2);
    }

    function test_submitJob_transitionsToSubmitted() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        dc.submitJob(jobId, keccak256("deliverable"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Submitted));
    }

    function test_submitJob_revertsWhenNotFunded() public {
        uint256 jobId = _createJob();

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dc.submitJob(jobId, keccak256("deliverable"));
    }

    function test_submitJob_revertsForEvaluatorRole() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        vm.expectRevert();
        dc.submitJob(jobId, keccak256("deliverable"));
    }

    function test_submitJob_revertsOnNonexistentJob() public {
        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dc.submitJob(NONEXISTENT_JOB_ID, keccak256("deliverable"));
    }

    function test_rejectOpenJob_cancelsBeforeFunding() public {
        uint256 jobId = _createJob();

        vm.prank(providerOperator);
        dc.rejectOpenJob(jobId, bytes32("withdrawn"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
    }

    function test_rejectOpenJob_revertsOnceFunded() public {
        uint256 jobId = _createFundedJob();

        // Past Open, only the evaluator may reject.
        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dc.rejectOpenJob(jobId, bytes32("too late"));
    }

    function test_submitJobClaim_filesMilestone() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, BUDGET / 2, keccak256("milestone"));

        assertTrue(escrow.pendingClaimHash(jobId) != bytes32(0));
    }

    function test_submitJobClaim_revertsOnEmptyDeliverable() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.EmptyDeliverable.selector);
        dc.submitJobClaim(jobId, BUDGET / 2, bytes32(0));
    }

    function test_submitJobClaim_revertsWhenExceedingBudget() public {
        uint256 jobId = _createFundedJob();

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.ExceedsBudget.selector);
        dc.submitJobClaim(jobId, BUDGET + 1, keccak256("milestone"));
    }

    function test_withdrawJobClaim_clearsPendingClaim() public {
        uint256 jobId = _createFundedJob();
        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, BUDGET / 2, keccak256("milestone"));

        vm.prank(providerOperator);
        dc.withdrawJobClaim(jobId, BUDGET / 2, keccak256("milestone"), bytes32("withdrawn"));

        assertEq(escrow.pendingClaimHash(jobId), bytes32(0));
    }
}
