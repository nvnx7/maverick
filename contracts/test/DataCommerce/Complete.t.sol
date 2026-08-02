// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract CompleteTest is BaseTest {
    function test_complete_paysPlatformFeeEvaluatorFeeAndProviderNet() public {
        uint256 jobId = _createSubmittedJob();

        uint256 expectedPlatformFee = (JOB_BUDGET * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedEvalFee = (JOB_BUDGET * EVALUATOR_FEE_BPS) / 10000;
        uint256 expectedNet = JOB_BUDGET - expectedPlatformFee - expectedEvalFee;

        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Completed));
        assertEq(paymentToken.balanceOf(treasury), expectedPlatformFee);
        assertEq(paymentToken.balanceOf(evaluator), expectedEvalFee);
        assertEq(paymentToken.balanceOf(provider), expectedNet);
        assertEq(paymentToken.balanceOf(address(dataCommerce)), 0);
    }

    function test_complete_zeroBudgetJobPaysNothing() public {
        uint256 jobId = _createJob();
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), 0, "");
        vm.prank(client);
        dataCommerce.fund(jobId, address(paymentToken), 0, "");
        vm.prank(provider);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");

        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(paymentToken.balanceOf(provider), 0);
    }

    function test_complete_revertsOnNonexistentJob() public {
        vm.prank(evaluator);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.complete(NONEXISTENT_JOB_ID, bytes32("approved"), "");
    }

    function test_complete_revertsWhenNotEvaluator() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.complete(jobId, bytes32("approved"), "");
    }

    function test_complete_revertsWhenNotSubmitted() public {
        uint256 jobId = _createFundedJob(); // Funded, not yet Submitted

        vm.prank(evaluator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.complete(jobId, bytes32("approved"), "");
    }

    function test_complete_revertsOnceAlreadyCompleted() public {
        uint256 jobId = _createSubmittedJob();
        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");

        vm.prank(evaluator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.complete(jobId, bytes32("approved"), "");
    }
}
