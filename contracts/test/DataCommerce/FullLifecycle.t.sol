// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

/// @dev Integration-level checks that chain multiple stages together. Per-stage
///      validation and bad-path coverage lives in the sibling *.t.sol files.
contract FullLifecycleTest is BaseTest {
    function test_happyPath_openFundedSubmittedCompleted() public {
        uint256 jobId = _createJob();
        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Open));

        _setBudget(jobId);
        _fund(jobId);
        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Funded));

        _submit(jobId);
        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Submitted));

        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");
        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
    }

    function test_rejectionPath_openFundedRejected() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluator);
        dataCommerce.reject(jobId, bytes32("bad spec"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
    }

    function test_expiryPath_openFundedExpired() public {
        uint256 jobId = _createFundedJob();
        vm.warp(expiredAt);

        dataCommerce.claimRefund(jobId);

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
    }

    function test_multipleJobs_haveIndependentState() public {
        uint256 jobA = _createFundedJob();
        uint256 jobB = _createFundedJob();

        _submit(jobA);
        vm.prank(evaluator);
        dataCommerce.complete(jobA, bytes32("approved"), "");

        vm.prank(evaluator);
        dataCommerce.reject(jobB, bytes32("bad spec"), "");

        assertEq(uint8(dataCommerce.getJob(jobA).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(uint8(dataCommerce.getJob(jobB).status), uint8(ERC8183.JobStatus.Rejected));
    }
}
