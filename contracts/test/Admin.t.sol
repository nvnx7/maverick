// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {ERC8183WithAuthorization} from "erc-8183/contracts/ERC8183WithAuthorization.sol";
import {DataCommerce} from "../src/DataCommerce.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

contract AdminTest is BaseTest {
    function test_setCommerce_updates() public {
        address newEscrow = address(_deployEscrow());

        vm.prank(admin);
        dc.setCommerce(newEscrow);

        assertEq(address(dc.commerce()), newEscrow);
    }

    function test_setCommerce_revertsOnZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        dc.setCommerce(address(0));
    }

    function test_setCommerce_revertsForNonAdmin() public {
        vm.prank(providerOperator);
        vm.expectRevert();
        dc.setCommerce(address(escrow));
    }

    function test_setTreasury_appliesToFutureJobsOnly() public {
        uint256 existing = _createJob();
        address newTreasury = makeAddr("newTreasury");

        vm.prank(admin);
        dc.setTreasury(newTreasury);

        assertEq(dc.treasury(), newTreasury);
        assertEq(dc.getJob(existing).payoutReceiver, treasury, "existing job keeps its pinned receiver");
        assertEq(dc.getJob(_createJob()).payoutReceiver, newTreasury, "new job uses the new treasury");
    }

    function test_setTreasury_revertsOnZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        dc.setTreasury(address(0));
    }

    function test_setTreasury_revertsForNonAdmin() public {
        vm.prank(stranger);
        vm.expectRevert();
        dc.setTreasury(makeAddr("newTreasury"));
    }

    function test_setPayoutToken_updates() public {
        vm.prank(admin);
        escrow.setPaymentTokenAllowed(address(notAllowedToken), true);

        vm.prank(admin);
        dc.setPayoutToken(address(notAllowedToken));

        assertEq(dc.payoutToken(), address(notAllowedToken));
    }

    function test_setPayoutToken_revertsOnZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        dc.setPayoutToken(address(0));
    }

    function test_createDataJob_revertsWhenTokenNotAllowlistedOnEscrow() public {
        vm.prank(admin);
        dc.setPayoutToken(address(notAllowedToken));

        // Build the signature first: it reads from the escrow, which would consume the cheatcodes.
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.PaymentTokenNotAllowed.selector);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_sweepAgentBalances_revertsForNonAdmin() public {
        vm.prank(providerOperator);
        vm.expectRevert();
        dc.sweepAgentBalances(address(paymentToken));
    }

    function test_sweepAgentBalances_isNoOpWhenAgentsEmpty() public {
        uint256 before = paymentToken.balanceOf(treasury);

        vm.prank(admin);
        dc.sweepAgentBalances(address(paymentToken));

        assertEq(paymentToken.balanceOf(treasury), before);
    }

    function test_roleAdminCanDelegateOperators() public {
        address newOperator = makeAddr("newOperator");
        // Read the role id before pranking — it is an external call that consumes the prank.
        bytes32 providerRole = dc.PROVIDER_ROLE();

        vm.prank(admin);
        dc.grantRole(providerRole, newOperator);

        uint256 jobId = _createFundedJob();
        vm.prank(newOperator);
        dc.submitJob(jobId, keccak256("deliverable"));

        assertEq(uint8(dc.getJob(jobId).status), uint8(ERC8183.JobStatus.Submitted));
    }
}
