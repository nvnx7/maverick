// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {ERC8183WithAuthorization} from "erc-8183/contracts/ERC8183WithAuthorization.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

contract CreationTest is BaseTest {
    function test_seatsAgentsAsProviderAndEvaluator() public {
        uint256 jobId = _createJob();

        ERC8183.Job memory job = dc.getJob(jobId);
        assertEq(job.provider, address(providerAgent));
        assertEq(job.evaluator, address(evaluatorAgent));
    }

    function test_clientIsTheSignerNotTheRelayer() public {
        uint256 jobId = _createJob();

        ERC8183.Job memory job = dc.getJob(jobId);
        assertEq(job.client, buyer);
        assertTrue(job.client != providerOperator);
        assertTrue(job.client != address(dc));
    }

    function test_setsBudgetAndPayoutReceiverInSameCall() public {
        uint256 jobId = _createJob();

        ERC8183.Job memory job = dc.getJob(jobId);
        assertEq(job.paymentToken, address(paymentToken));
        assertEq(job.budget, BUDGET);
        assertEq(job.payoutReceiver, treasury);
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Open));
    }

    function test_incrementsJobId() public {
        uint256 first = _createJob();
        uint256 second = _createJob();
        assertEq(second, first + 1);
    }

    function test_revertsWhenSignatureNamesDifferentProvider() public {
        ERC8183WithAuthorization.Authorization memory auth =
            _clientAuthFor(stranger, address(evaluatorAgent), expiredAt, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183WithAuthorization.InvalidAuthorizationSignature.selector);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_revertsWhenSignatureNamesDifferentEvaluator() public {
        ERC8183WithAuthorization.Authorization memory auth =
            _clientAuthFor(address(providerAgent), stranger, expiredAt, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183WithAuthorization.InvalidAuthorizationSignature.selector);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_revertsWhenDescriptionDiffersFromSignature() public {
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183WithAuthorization.InvalidAuthorizationSignature.selector);
        dc.createDataJob(_params(expiredAt, "tampered", BUDGET), auth);
    }

    function test_revertsOnReusedNonce() public {
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 42);

        vm.prank(providerOperator);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183WithAuthorization.AuthorizationNonceUsed.selector);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_revertsOnExpiredAuthorization() public {
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);
        vm.warp(block.timestamp + AUTH_WINDOW + 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183WithAuthorization.AuthorizationExpired.selector);
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_revertsOnExpiryTooShort() public {
        uint48 tooSoon = uint48(block.timestamp + 1 minutes);
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(tooSoon, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(ERC8183.ExpiryTooShort.selector);
        dc.createDataJob(_params(tooSoon, "data job", BUDGET), auth);
    }

    function test_revertsForNonProviderRole() public {
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);

        vm.prank(stranger);
        vm.expectRevert();
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_revertsForEvaluatorRole() public {
        ERC8183WithAuthorization.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);

        vm.prank(evaluatorOperator);
        vm.expectRevert();
        dc.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }
}
