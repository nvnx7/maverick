// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {DataCommerce} from "../../src/DataCommerce.sol";
import {BaseTest} from "../BaseTest.sol";

contract InitializeTest is BaseTest {
    function test_initialize_setsTreasury() public view {
        assertEq(dataCommerce.platformTreasury(), treasury);
    }

    function test_initialize_setsAdminAsDeployer() public view {
        assertTrue(dataCommerce.hasRole(dataCommerce.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(dataCommerce.hasRole(dataCommerce.ADMIN_ROLE(), admin));
        assertFalse(dataCommerce.hasRole(dataCommerce.ADMIN_ROLE(), notAdmin));
    }

    function test_initialize_setsPayoutTokenAllowed() public view {
        assertTrue(dataCommerce.allowedPaymentTokens(address(paymentToken)));
    }

    function test_initialize_setsFees() public view {
        assertEq(dataCommerce.platformFeeBP(), PLATFORM_FEE_BPS);
        assertEq(dataCommerce.evaluatorFeeBP(), EVALUATOR_FEE_BPS);
    }

    function test_initialize_revertsOnZeroTreasury() public {
        DataCommerce implementation = _deployImplementation();
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        _initProxy(address(implementation), address(0), address(paymentToken), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_initialize_revertsOnZeroPayoutToken() public {
        DataCommerce implementation = _deployImplementation();
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        _initProxy(address(implementation), treasury, address(0), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_initialize_revertsOnFeesTooHigh() public {
        DataCommerce implementation = _deployImplementation();
        vm.expectRevert(ERC8183.FeesTooHigh.selector);
        _initProxy(address(implementation), treasury, address(paymentToken), 9000, 1001);
    }

    function test_initialize_cannotBeCalledTwice() public {
        vm.expectRevert();
        dataCommerce.initialize(treasury, address(paymentToken), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_implementation_cannotBeInitializedDirectly() public {
        DataCommerce implementation = _deployImplementation();
        vm.expectRevert();
        implementation.initialize(treasury, address(paymentToken), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_legacyTwoArgInitialize_isDisabled() public {
        DataCommerce implementation = _deployImplementation();
        vm.expectRevert();
        implementation.initialize(treasury, notAdmin);
    }
}
