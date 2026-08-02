// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {BaseTest} from "../BaseTest.sol";

contract CreationTest is BaseTest {
    function test_createJob_opensJobWithClientProviderEvaluator() public {
        vm.prank(client);
        uint256 jobId = dataCommerce.createJob(provider, evaluator, expiredAt, "job description", address(0), 0);

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(job.client, client);
        assertEq(job.provider, provider);
        assertEq(job.evaluator, evaluator);
        assertEq(job.expiredAt, expiredAt);
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Open));
    }

    function test_createJob_allowsUnassignedProvider() public {
        uint256 jobId = _createJobWithoutProvider();

        ERC8183.Job memory job = dataCommerce.getJob(jobId);
        assertEq(job.provider, address(0));
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Open));
    }

    function test_createJob_incrementsJobId() public {
        uint256 firstId = _createJob();
        uint256 secondId = _createJob();
        assertEq(secondId, firstId + 1);
    }

    function test_createJob_revertsOnExpiryTooShort() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.ExpiryTooShort.selector);
        dataCommerce.createJob(provider, evaluator, uint48(block.timestamp + 1 minutes), "x", address(0), 0);
    }

    function test_createJob_revertsWhenClientIsProvider() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.ClientCannotBeProvider.selector);
        dataCommerce.createJob(client, evaluator, expiredAt, "x", address(0), 0);
    }

    function test_createJob_revertsOnZeroEvaluator() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        dataCommerce.createJob(provider, address(0), expiredAt, "x", address(0), 0);
    }

    function test_createJob_revertsWhenProviderIsEvaluator() public {
        vm.prank(client);
        vm.expectRevert(ERC8183.ProviderCannotBeEvaluator.selector);
        dataCommerce.createJob(provider, provider, expiredAt, "x", address(0), 0);
    }

    function test_createJob_revertsOnUnwhitelistedHook() public {
        address unwhitelistedHook = makeAddr("unwhitelistedHook");
        vm.prank(client);
        vm.expectRevert(ERC8183.HookNotWhitelisted.selector);
        dataCommerce.createJob(provider, evaluator, expiredAt, "x", unwhitelistedHook, 0);
    }

    function test_createJob_revertsWhenPaused() public {
        vm.prank(admin);
        dataCommerce.pause();

        vm.prank(client);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        dataCommerce.createJob(provider, evaluator, expiredAt, "x", address(0), 0);
    }
}
