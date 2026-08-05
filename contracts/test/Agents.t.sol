// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {AgenticCommerce} from "../src/AgenticCommerce.sol";
import {DataCommerce} from "../src/DataCommerce.sol";
import {BaseAgent} from "../src/agents/BaseAgent.sol";
import {ProviderAgent} from "../src/agents/ProviderAgent.sol";
import {EvaluatorAgent} from "../src/agents/EvaluatorAgent.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

contract AgentsTest is BaseTest {
    function test_agentsAreWiredToEntrypointAndEscrow() public view {
        assertEq(providerAgent.entrypoint(), address(dc));
        assertEq(evaluatorAgent.entrypoint(), address(dc));
        assertEq(providerAgent.escrow(), address(escrow));
        assertEq(evaluatorAgent.escrow(), address(escrow));
    }

    function test_execute_revertsForNonEntrypoint() public {
        bytes memory data = abi.encodeCall(ERC8183.submit, (1, keccak256("x"), ""));

        vm.prank(admin);
        vm.expectRevert(BaseAgent.NotEntrypoint.selector);
        providerAgent.execute(data);

        vm.prank(providerOperator);
        vm.expectRevert(BaseAgent.NotEntrypoint.selector);
        evaluatorAgent.execute(data);
    }

    function test_sweep_revertsForNonEntrypoint() public {
        vm.prank(admin);
        vm.expectRevert(BaseAgent.NotEntrypoint.selector);
        evaluatorAgent.sweep(address(paymentToken), admin, 1);
    }

    function test_setEntrypoint_revertsForNonEntrypoint() public {
        vm.prank(admin);
        vm.expectRevert(BaseAgent.NotEntrypoint.selector);
        providerAgent.setEntrypoint(stranger);
    }

    function test_constructor_revertsOnZeroAddress() public {
        vm.expectRevert(BaseAgent.ZeroAddress.selector);
        new ProviderAgent(address(0), address(dc));

        vm.expectRevert(BaseAgent.ZeroAddress.selector);
        new EvaluatorAgent(address(escrow), address(0));
    }

    function test_setAgents_updatesBoth() public {
        (ProviderAgent newProvider, EvaluatorAgent newEvaluator) = _deployAgents(dc);

        vm.prank(admin);
        dc.setAgents(address(newProvider), address(newEvaluator));

        assertEq(address(dc.providerAgent()), address(newProvider));
        assertEq(address(dc.evaluatorAgent()), address(newEvaluator));
    }

    function test_setAgents_revertsWhenIdentical() public {
        vm.prank(admin);
        vm.expectRevert(DataCommerce.AgentsMustDiffer.selector);
        dc.setAgents(address(providerAgent), address(providerAgent));
    }

    function test_setAgents_revertsOnZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        dc.setAgents(address(0), address(evaluatorAgent));

        vm.prank(admin);
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        dc.setAgents(address(providerAgent), address(0));
    }

    function test_setAgents_revertsForNonAdmin() public {
        vm.prank(providerOperator);
        vm.expectRevert();
        dc.setAgents(address(providerAgent), address(evaluatorAgent));
    }

    function test_createDataJob_revertsWhenAgentsUnset() public {
        DataCommerce fresh = _deployEntrypoint(address(escrow), treasury, address(paymentToken));
        // Build the signature first: it reads from the escrow, which would consume the cheatcodes.
        AgenticCommerce.Authorization memory auth = _clientAuth(expiredAt, "data job", 1);

        vm.prank(providerOperator);
        vm.expectRevert(DataCommerce.AgentsNotSet.selector);
        fresh.createDataJob(_params(expiredAt, "data job", BUDGET), auth);
    }

    function test_migrateAgents_handsControlOverPreservingIdentity() public {
        address newEntrypoint = makeAddr("newEntrypoint");

        vm.prank(admin);
        dc.migrateAgents(newEntrypoint);

        assertEq(providerAgent.entrypoint(), newEntrypoint);
        assertEq(evaluatorAgent.entrypoint(), newEntrypoint);
        assertEq(providerAgent.escrow(), address(escrow), "seat identity unchanged");
        assertEq(evaluatorAgent.escrow(), address(escrow), "seat identity unchanged");
    }

    function test_migrateAgents_leavesOldEntrypointPowerless() public {
        uint256 jobId = _createFundedJob();

        vm.prank(admin);
        dc.migrateAgents(makeAddr("newEntrypoint"));

        vm.prank(providerOperator);
        vm.expectRevert(BaseAgent.NotEntrypoint.selector);
        dc.submitJob(jobId, keccak256("deliverable"));
    }

    function test_migrateAgents_revertsForNonAdmin() public {
        vm.prank(providerOperator);
        vm.expectRevert();
        dc.migrateAgents(makeAddr("newEntrypoint"));
    }
}
