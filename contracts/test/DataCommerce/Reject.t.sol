// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract RejectTest is BaseTest {
    function test_reject_openJobByClient() public {
        uint256 jobId = _createJob();

        vm.prank(client);
        dataCommerce.reject(jobId, bytes32("changed my mind"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
    }

    function test_reject_openJobByProvider() public {
        uint256 jobId = _createJob();

        vm.prank(provider);
        dataCommerce.reject(jobId, bytes32("can't do it"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
    }

    function test_reject_openJobRevertsForStranger() public {
        uint256 jobId = _createJob();

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.reject(jobId, bytes32("nope"), "");
    }

    function test_reject_fundedJobByEvaluatorRefundsClient() public {
        uint256 jobId = _createFundedJob();

        vm.prank(evaluator);
        dataCommerce.reject(jobId, bytes32("bad spec"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
        assertEq(paymentToken.balanceOf(address(dataCommerce)), 0);
    }

    function test_reject_fundedJobRevertsForClient() public {
        uint256 jobId = _createFundedJob();

        vm.prank(client);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.reject(jobId, bytes32("nope"), "");
    }

    function test_reject_fundedJobRevertsForProvider() public {
        uint256 jobId = _createFundedJob();

        vm.prank(provider);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.reject(jobId, bytes32("nope"), "");
    }

    function test_reject_submittedJobByEvaluatorRefundsClient() public {
        uint256 jobId = _createSubmittedJob();

        vm.prank(evaluator);
        dataCommerce.reject(jobId, bytes32("bad deliverable"), "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Rejected));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
    }

    function test_reject_revertsOnNonexistentJob() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.reject(NONEXISTENT_JOB_ID, bytes32("nope"), "");
    }

    function test_reject_revertsOnceAlreadyCompleted() public {
        uint256 jobId = _createSubmittedJob();
        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");

        vm.prank(evaluator);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.reject(jobId, bytes32("too late"), "");
    }
}
