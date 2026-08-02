// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract SetBudgetTest is BaseTest {
    function test_setBudget_setsPaymentTokenAndAmount() public {
        uint256 jobId = _createJob();

        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(job.paymentToken, address(paymentToken));
        assertEq(job.budget, JOB_BUDGET);
    }

    function test_setBudget_isRepeatableWhileOpen() public {
        uint256 jobId = _createJob();

        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET * 2, "");

        assertEq(dataCommerce.getJob(jobId).budget, JOB_BUDGET * 2);
    }

    function test_setBudget_revertsOnNonexistentJob() public {
        vm.prank(provider);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.setBudget(NONEXISTENT_JOB_ID, address(paymentToken), JOB_BUDGET, "");
    }

    function test_setBudget_revertsWhenNotProvider() public {
        uint256 jobId = _createJob();

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    function test_setBudget_revertsOnZeroToken() public {
        uint256 jobId = _createJob();

        vm.prank(provider);
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        dataCommerce.setBudget(jobId, address(0), JOB_BUDGET, "");
    }

    function test_setBudget_revertsOnNotAllowedToken() public {
        uint256 jobId = _createJob();

        vm.prank(provider);
        vm.expectRevert(ERC8183.PaymentTokenNotAllowed.selector);
        dataCommerce.setBudget(jobId, address(notAllowedToken), JOB_BUDGET, "");
    }

    function test_setBudget_revertsOnceFunded() public {
        uint256 jobId = _createFundedJob();

        vm.prank(provider);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    function test_setBudget_revertsAfterExpiry() public {
        uint256 jobId = _createJob();
        vm.warp(expiredAt);

        vm.prank(provider);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");
    }
}
