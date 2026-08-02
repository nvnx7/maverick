// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract FundTest is BaseTest {
    function test_fund_transitionsToFundedAndEscrowsBudget() public {
        uint256 jobId = _createFundedJob();

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Funded));
        assertEq(paymentToken.balanceOf(address(dataCommerce)), JOB_BUDGET);
        assertEq(paymentToken.balanceOf(client), 0);
    }

    function test_fund_zeroBudgetJobTransitionsWithoutTransfer() public {
        uint256 jobId = _createJob();
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), 0, "");

        vm.prank(client);
        dataCommerce.fund(jobId, address(paymentToken), 0, "");

        assertEq(uint8(dataCommerce.getJob(jobId).status), uint8(ERC8183.JobStatus.Funded));
        assertEq(paymentToken.balanceOf(address(dataCommerce)), 0);
    }

    function test_fund_revertsOnNonexistentJob() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.fund(NONEXISTENT_JOB_ID, address(paymentToken), JOB_BUDGET, "");
    }

    function test_fund_revertsWhenNotClient() public {
        uint256 jobId = _createJob();
        _setBudget(jobId);

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.fund(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    function test_fund_revertsWhenProviderNotSet() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(client);
        vm.expectRevert(ERC8183.ProviderNotSet.selector);
        dataCommerce.fund(jobId, address(paymentToken), 0, "");
    }

    function test_fund_revertsOnceAlreadyFunded() public {
        uint256 jobId = _createFundedJob();

        paymentToken.mint(client, JOB_BUDGET);
        vm.prank(client);
        paymentToken.approve(address(dataCommerce), JOB_BUDGET);
        vm.prank(client);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.fund(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    function test_fund_revertsAfterExpiry() public {
        uint256 jobId = _createJob();
        _setBudget(jobId);
        vm.warp(expiredAt);

        vm.prank(client);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.fund(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    function test_fund_revertsOnPaymentTokenMismatch() public {
        uint256 jobId = _createJob();
        _setBudget(jobId);

        vm.prank(client);
        vm.expectRevert(ERC8183.PaymentTokenMismatch.selector);
        dataCommerce.fund(jobId, address(notAllowedToken), JOB_BUDGET, "");
    }

    function test_fund_revertsOnBudgetMismatch() public {
        uint256 jobId = _createJob();
        _setBudget(jobId);

        vm.prank(client);
        vm.expectRevert(ERC8183.BudgetMismatch.selector);
        dataCommerce.fund(jobId, address(paymentToken), JOB_BUDGET + 1, "");
    }

    function test_fund_revertsOnFeeOnTransferToken() public {
        _allowPaymentToken(address(feeOnTransferToken));

        uint256 jobId = _createJob();
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(feeOnTransferToken), JOB_BUDGET, "");

        feeOnTransferToken.mint(client, JOB_BUDGET);
        vm.prank(client);
        feeOnTransferToken.approve(address(dataCommerce), JOB_BUDGET);

        vm.prank(client);
        vm.expectRevert(ERC8183.UnexpectedFundedAmount.selector);
        dataCommerce.fund(jobId, address(feeOnTransferToken), JOB_BUDGET, "");
    }
}
