// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract ClaimRefundTest is BaseTest {
    function test_claimRefund_openJobAfterExpiryByStranger() public {
        uint256 jobId = _createJob();
        vm.warp(expiredAt);

        vm.prank(stranger);
        dataCommerce.claimRefund(jobId);

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
    }

    function test_claimRefund_openJobRevertsBeforeExpiry() public {
        uint256 jobId = _createJob();

        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.claimRefund(jobId);
    }

    function test_claimRefund_fundedJobAfterExpiryRefundsClient() public {
        uint256 jobId = _createFundedJob();
        vm.warp(expiredAt);

        dataCommerce.claimRefund(jobId);

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
        assertEq(paymentToken.balanceOf(address(dataCommerce)), 0);
    }

    function test_claimRefund_fundedJobRevertsBeforeExpiry() public {
        uint256 jobId = _createFundedJob();

        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.claimRefund(jobId);
    }

    function test_claimRefund_submittedJobRevertsDuringGracePeriod() public {
        uint256 jobId = _createSubmittedJob();
        vm.warp(expiredAt); // exactly at expiry, grace period not yet elapsed

        vm.expectRevert(ERC8183.GracePeriodActive.selector);
        dataCommerce.claimRefund(jobId);
    }

    function test_claimRefund_submittedJobRefundsAfterGracePeriod() public {
        uint256 jobId = _createSubmittedJob();
        vm.warp(expiredAt + dataCommerce.EVALUATION_GRACE_PERIOD());

        dataCommerce.claimRefund(jobId);

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Expired));
        assertEq(paymentToken.balanceOf(client), JOB_BUDGET);
    }

    function test_claimRefund_revertsOnNonexistentJob() public {
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.claimRefund(NONEXISTENT_JOB_ID);
    }

    function test_claimRefund_revertsOnceAlreadyCompleted() public {
        uint256 jobId = _createSubmittedJob();
        vm.prank(evaluator);
        dataCommerce.complete(jobId, bytes32("approved"), "");
        vm.warp(expiredAt + dataCommerce.EVALUATION_GRACE_PERIOD());

        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.claimRefund(jobId);
    }
}
