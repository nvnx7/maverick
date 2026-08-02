// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract SetProviderTest is BaseTest {
    function test_setProvider_assignsProviderAndAgentId() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(client);
        dataCommerce.setProvider(jobId, provider, 42);

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(job.provider, provider);
        assertEq(job.providerAgentId, 42);
    }

    function test_setProvider_revertsOnNonexistentJob() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.InvalidJob.selector);
        dataCommerce.setProvider(NONEXISTENT_JOB_ID, provider, 0);
    }

    function test_setProvider_revertsWhenNotClient() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(stranger);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        dataCommerce.setProvider(jobId, provider, 0);
    }

    function test_setProvider_revertsWhenProviderAlreadySet() public {
        uint256 jobId = _createJob(); // already has `provider` assigned

        vm.prank(client);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.setProvider(jobId, makeAddr("otherProvider"), 0);
    }

    function test_setProvider_revertsOnZeroAddress() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(client);
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        dataCommerce.setProvider(jobId, address(0), 0);
    }

    function test_setProvider_revertsWhenProviderIsClient() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(client);
        vm.expectRevert(ERC8183.ClientCannotBeProvider.selector);
        dataCommerce.setProvider(jobId, client, 0);
    }

    function test_setProvider_revertsWhenProviderIsEvaluator() public {
        uint256 jobId = _createJobWithoutProvider();

        vm.prank(client);
        vm.expectRevert(ERC8183.ProviderCannotBeEvaluator.selector);
        dataCommerce.setProvider(jobId, evaluator, 0);
    }

    function test_setProvider_revertsAfterExpiry() public {
        uint256 jobId = _createJobWithoutProvider();
        vm.warp(expiredAt);

        vm.prank(client);
        vm.expectRevert(ERC8183.WrongStatus.selector);
        dataCommerce.setProvider(jobId, provider, 0);
    }
}
