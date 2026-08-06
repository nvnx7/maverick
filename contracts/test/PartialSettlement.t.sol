// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

/// @dev Milestone claims move money while the job stays Funded. `settledAmount` is the
///      running total, so every later payout and refund is against the remainder.
contract PartialSettlementTest is BaseTest {
    bytes32 internal constant M1 = keccak256("milestone-1");
    bytes32 internal constant M2 = keccak256("milestone-2");

    function _submitClaim(uint256 jobId, uint256 cumulative, bytes32 deliverable) internal {
        vm.prank(providerOperator);
        dc.submitJobClaim(jobId, cumulative, deliverable, contributor);
    }

    function _approveClaim(uint256 jobId, uint256 cumulative, bytes32 deliverable) internal {
        vm.prank(evaluatorOperator);
        dc.approveJobClaim(jobId, cumulative, deliverable, contributor);
    }

    // ──────────────────── Settlement accounting ────────────────────

    function test_jobStaysFundedAcrossSettlement() public {
        uint256 jobId = _createFundedJob();

        _submitClaim(jobId, BUDGET / 4, M1);
        _approveClaim(jobId, BUDGET / 4, M1);

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Funded));
    }

    function test_cumulativeAmountsAccumulateAcrossMilestones() public {
        uint256 jobId = _createFundedJob();
        uint256 first = BUDGET / 4;
        uint256 second = BUDGET / 2; // cumulative, not a delta

        _submitClaim(jobId, first, M1);
        _approveClaim(jobId, first, M1);
        assertEq(dc.getJob(jobId).settledAmount, first);

        _submitClaim(jobId, second, M2);
        _approveClaim(jobId, second, M2);
        assertEq(dc.getJob(jobId).settledAmount, second, "second claim is cumulative");
    }

    function test_eachSettlementSplitsFeesOnTheDeltaOnly() public {
        uint256 jobId = _createFundedJob();
        uint256 first = BUDGET / 4;
        uint256 second = BUDGET / 2;
        uint256 delta = second - first;

        _submitClaim(jobId, first, M1);
        _approveClaim(jobId, first, M1);
        _submitClaim(jobId, second, M2);
        _approveClaim(jobId, second, M2);

        assertEq(
            paymentToken.balanceOf(treasury),
            platformFee(first) + platformFee(delta),
            "treasury paid per-delta, not per-cumulative"
        );
        assertEq(
            paymentToken.balanceOf(contributor),
            providerNet(first) + providerNet(delta),
            "contributor paid per-delta via fundDisburser"
        );
        assertEq(
            paymentToken.balanceOf(address(evaluatorAgent)),
            evaluatorFee(first) + evaluatorFee(delta),
            "evaluator fee accrues per-delta"
        );
    }

    function test_escrowRetainsUnsettledRemainder() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        _approveClaim(jobId, milestone, M1);

        assertEq(paymentToken.balanceOf(address(escrow)), BUDGET - milestone);
    }

    function test_completePaysOnlyRemainderAndDrainsEscrow() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        _approveClaim(jobId, milestone, M1);

        _submit(jobId);
        _complete(jobId);

        assertEq(paymentToken.balanceOf(address(escrow)), 0, "escrow drained");
        assertEq(dc.getJob(jobId).settledAmount, milestone, "settledAmount unchanged by complete");

        vm.prank(admin);
        dc.sweepAgentBalances(address(paymentToken));

        uint256 remainder = BUDGET - milestone;
        assertEq(
            paymentToken.balanceOf(treasury),
            platformFee(milestone) + evaluatorFee(milestone) + platformFee(remainder) + evaluatorFee(remainder),
            "treasury holds only fees"
        );
        assertEq(
            paymentToken.balanceOf(contributor),
            providerNet(milestone) + providerNet(remainder),
            "contributor holds provider-side net via fundDisburser"
        );
        assertEq(
            paymentToken.balanceOf(treasury) + paymentToken.balanceOf(contributor),
            BUDGET,
            "whole budget accounted for"
        );
    }

    function test_fullySettledJobPaysNothingOnComplete() public {
        uint256 jobId = _createFundedJob();

        _submitClaim(jobId, BUDGET, M1);
        _approveClaim(jobId, BUDGET, M1);
        assertEq(paymentToken.balanceOf(address(escrow)), 0);

        _submit(jobId);
        _complete(jobId);

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(paymentToken.balanceOf(address(escrow)), 0);
    }

    // ──────────────────── Refunds against the remainder ────────────────────

    function test_rejectRefundsOnlyUnsettledRemainder() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        _approveClaim(jobId, milestone, M1);

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobId, bytes32("bad deliverable"));

        assertEq(paymentToken.balanceOf(buyer), BUDGET - milestone, "settled portion is not clawed back");
        assertEq(paymentToken.balanceOf(address(escrow)), 0);
    }

    function test_expiryRefundsOnlyUnsettledRemainder() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        _approveClaim(jobId, milestone, M1);

        vm.warp(expiredAt);
        escrow.claimRefund(jobId);

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(buyer), BUDGET - milestone);
    }

    // ──────────────────── Pending-claim invariants ────────────────────

    function test_onlyOnePendingClaimAtATime() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.PendingClaimExists.selector);
        dc.submitJobClaim(jobId, BUDGET / 2, M2, contributor);
    }

    function test_claimMustAdvanceSettledAmount() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        _approveClaim(jobId, milestone, M1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.NoNewSettlement.selector);
        dc.submitJobClaim(jobId, milestone, M2, contributor);
    }

    function test_identicalClaimCannotBeRefiledAfterWithdrawal() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        vm.prank(providerOperator);
        dc.withdrawJobClaim(jobId, milestone, M1, bytes32("withdrawn"), contributor);

        // The hash stays consumed; refiling requires different terms.
        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.ClaimAlreadySubmitted.selector);
        dc.submitJobClaim(jobId, milestone, M1, contributor);
    }

    function test_withdrawnClaimCanBeRefiledWithDifferentTerms() public {
        uint256 jobId = _createFundedJob();
        uint256 milestone = BUDGET / 4;

        _submitClaim(jobId, milestone, M1);
        vm.prank(providerOperator);
        dc.withdrawJobClaim(jobId, milestone, M1, bytes32("withdrawn"), contributor);

        _submitClaim(jobId, milestone, M2);
        _approveClaim(jobId, milestone, M2);
        assertEq(dc.getJob(jobId).settledAmount, milestone);
    }

    function test_claimCannotExceedRemainingBudget() public {
        uint256 jobId = _createFundedJob();

        _submitClaim(jobId, BUDGET / 2, M1);
        _approveClaim(jobId, BUDGET / 2, M1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.ExceedsBudget.selector);
        dc.submitJobClaim(jobId, BUDGET + 1, M2, contributor);
    }

    function test_claimsRequireFundedStatus() public {
        uint256 jobId = _createJob(); // Open, not funded

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dc.submitJobClaim(jobId, BUDGET / 4, M1, contributor);
    }

    function test_claimsRejectedOnceSubmitted() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dc.submitJobClaim(jobId, BUDGET / 4, M1, contributor);
    }

    // ──────────────────── Pending claim vs. lifecycle transitions ────────────────────

    function test_submitSupersedesPendingClaim() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        _submit(jobId);

        assertEq(escrow.pendingClaimHash(jobId), bytes32(0), "pending claim cleared");
        assertEq(dc.getJob(jobId).settledAmount, 0, "superseded claim pays nothing");
    }

    function test_rejectClearsPendingClaim() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        vm.prank(evaluatorOperator);
        dc.rejectJob(jobId, bytes32("bad spec"));

        assertEq(escrow.pendingClaimHash(jobId), bytes32(0));
        assertEq(paymentToken.balanceOf(buyer), BUDGET, "nothing was settled, full refund");
    }

    function test_expiryBlockedWhilePendingClaimOutstanding() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);
        vm.warp(expiredAt);

        vm.expectRevert(ERC8183.PendingClaimExists.selector);
        escrow.claimRefund(jobId);
    }

    function test_expiryProceedsOnceClaimResolved() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        vm.prank(evaluatorOperator);
        dc.rejectJobClaim(jobId, BUDGET / 4, M1, bytes32("rejected"), contributor);

        vm.warp(expiredAt);
        escrow.claimRefund(jobId);

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(buyer), BUDGET);
    }

    // ──────────────────── Authorization ────────────────────

    function test_approveClaimRequiresEvaluatorRole() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        vm.prank(providerOperator);
        vm.expectRevert();
        dc.approveJobClaim(jobId, BUDGET / 4, M1, contributor);
    }

    function test_submitClaimRequiresProviderRole() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluatorOperator);
        vm.expectRevert();
        dc.submitJobClaim(jobId, BUDGET / 4, M1, contributor);
    }

    function test_approveMustMatchPendingClaimTerms() public {
        uint256 jobId = _createFundedJob();
        _submitClaim(jobId, BUDGET / 4, M1);

        vm.prank(evaluatorOperator);
        vm.expectRevert(ERC8183.NoPendingClaim.selector);
        dc.approveJobClaim(jobId, BUDGET / 2, M1, contributor); // amount differs from what was filed
    }
}
