// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract SubmitTest is BaseTest {
    function test_submit_transitionsToSubmittedAndRecordsTimestamp() public {
        uint256 jobId = _createFundedJob();

        vm.prank(provider);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Submitted));
        assertEq(job.submittedAt, block.timestamp);
    }

    function test_submit_allowedFromOpenWithZeroBudget() public {
        uint256 jobId = _createJob();
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), 0, "");

        vm.prank(provider);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Submitted));
    }

    function test_submit_revertsOnNonexistentJob() public {
        vm.prank(provider);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.submit(NONEXISTENT_JOB_ID, keccak256("deliverable"), "");
    }

    function test_submit_revertsWhenNotProvider() public {
        uint256 jobId = _createFundedJob();

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");
    }

    function test_submit_revertsWhenStillOpenWithBudget() public {
        uint256 jobId = _createJob();
        _setBudget(jobId); // budget > 0, not yet funded

        vm.prank(provider);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");
    }

    function test_submit_revertsAfterExpiry() public {
        uint256 jobId = _createFundedJob();
        vm.warp(expiredAt);

        vm.prank(provider);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");
    }

    function test_submit_revertsOnceAlreadySubmitted() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(provider);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");
    }
}
