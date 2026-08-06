// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {DataCommerce} from "../src/DataCommerce.sol";
import {BaseTest} from "./fixtures/BaseTest.sol";

contract InitializeTest is BaseTest {
    function test_storesConfiguration() public view {
        assertEq(address(dc.commerce()), address(escrow));
        assertEq(address(dc.fundDisburser()), address(fundDisburser));
        assertEq(dc.treasury(), treasury);
        assertEq(dc.payoutToken(), address(paymentToken));
    }

    function test_grantsRolesToDistinctOperators() public view {
        assertTrue(dc.hasRole(dc.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(dc.hasRole(dc.PROVIDER_ROLE(), providerOperator));
        assertTrue(dc.hasRole(dc.EVALUATOR_ROLE(), evaluatorOperator));

        assertFalse(dc.hasRole(dc.PROVIDER_ROLE(), admin));
        assertFalse(dc.hasRole(dc.EVALUATOR_ROLE(), admin));
        assertFalse(dc.hasRole(dc.DEFAULT_ADMIN_ROLE(), providerOperator));
    }

    function test_agentsStartUnset() public {
        DataCommerce fresh =
            _deployEntrypoint(address(escrow), address(fundDisburser), treasury, address(paymentToken));
        assertEq(address(fresh.providerAgent()), address(0));
        assertEq(address(fresh.evaluatorAgent()), address(0));
    }

    function test_revertsOnZeroCommerce() public {
        DataCommerce implementation = new DataCommerce();
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation),
            _initData(address(0), address(fundDisburser), treasury, address(paymentToken))
        );
    }

    function test_revertsOnZeroFundDisburser() public {
        DataCommerce implementation = new DataCommerce();
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation), _initData(address(escrow), address(0), treasury, address(paymentToken))
        );
    }

    function test_revertsOnZeroTreasury() public {
        DataCommerce implementation = new DataCommerce();
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation),
            _initData(address(escrow), address(fundDisburser), address(0), address(paymentToken))
        );
    }

    function test_revertsOnZeroPayoutToken() public {
        DataCommerce implementation = new DataCommerce();
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation), _initData(address(escrow), address(fundDisburser), treasury, address(0))
        );
    }

    function test_revertsOnZeroAdmin() public {
        DataCommerce implementation = new DataCommerce();
        bytes memory data = abi.encodeWithSignature(
            "initialize(address,address,address,address,address,address,address)",
            address(escrow),
            address(fundDisburser),
            treasury,
            address(paymentToken),
            address(0),
            providerOperator,
            evaluatorOperator
        );
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(address(implementation), data);
    }

    function test_revertsOnZeroProvider() public {
        DataCommerce implementation = new DataCommerce();
        bytes memory data = abi.encodeWithSignature(
            "initialize(address,address,address,address,address,address,address)",
            address(escrow),
            address(fundDisburser),
            treasury,
            address(paymentToken),
            admin,
            address(0),
            evaluatorOperator
        );
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(address(implementation), data);
    }

    function test_revertsOnZeroEvaluator() public {
        DataCommerce implementation = new DataCommerce();
        bytes memory data = abi.encodeWithSignature(
            "initialize(address,address,address,address,address,address,address)",
            address(escrow),
            address(fundDisburser),
            treasury,
            address(paymentToken),
            admin,
            providerOperator,
            address(0)
        );
        vm.expectRevert(DataCommerce.ZeroAddress.selector);
        new ERC1967Proxy(address(implementation), data);
    }

    function test_cannotBeCalledTwice() public {
        vm.expectRevert();
        dc.initialize(
            address(escrow),
            address(fundDisburser),
            treasury,
            address(paymentToken),
            admin,
            providerOperator,
            evaluatorOperator
        );
    }

    function test_implementationCannotBeInitializedDirectly() public {
        DataCommerce implementation = new DataCommerce();
        vm.expectRevert();
        implementation.initialize(
            address(escrow),
            address(fundDisburser),
            treasury,
            address(paymentToken),
            admin,
            providerOperator,
            evaluatorOperator
        );
    }
}
