// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC8183} from "erc8183/contracts/ERC8183.sol";
import {Commerce} from "../src/Commerce.sol";

contract CommerceTest is Test {
    Commerce internal commerce;
    address internal treasury = makeAddr("treasury");
    address internal notAdmin = makeAddr("notAdmin");
    address internal payoutToken = makeAddr("payoutToken");
    uint256 internal constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 internal constant EVALUATOR_FEE_BPS = 100; // 1%

    function _initData(
        address treasury_,
        address payoutToken_,
        uint256 platformFeeBps_,
        uint256 evaluatorFeeBps_
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)", treasury_, payoutToken_, platformFeeBps_, evaluatorFeeBps_
        );
    }

    function setUp() public {
        Commerce implementation = new Commerce();
        bytes memory initData = _initData(treasury, payoutToken, PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        commerce = Commerce(address(proxy));
    }

    function test_initialize_setsTreasury() public view {
        assertEq(commerce.platformTreasury(), treasury);
    }

    function test_initialize_setsDeployerAsAdmin() public view {
        assertTrue(commerce.hasRole(commerce.DEFAULT_ADMIN_ROLE(), address(this)));
        assertTrue(commerce.hasRole(commerce.ADMIN_ROLE(), address(this)));
    }

    function test_initialize_setsPayoutTokenAllowed() public view {
        assertTrue(commerce.allowedPaymentTokens(payoutToken));
    }

    function test_initialize_setsFees() public view {
        assertEq(commerce.platformFeeBP(), PLATFORM_FEE_BPS);
        assertEq(commerce.evaluatorFeeBP(), EVALUATOR_FEE_BPS);
    }

    function test_initialize_revertsOnZeroTreasury() public {
        Commerce implementation = new Commerce();
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation), _initData(address(0), payoutToken, PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS)
        );
    }

    function test_initialize_revertsOnZeroPayoutToken() public {
        Commerce implementation = new Commerce();
        vm.expectRevert(ERC8183.ZeroAddress.selector);
        new ERC1967Proxy(
            address(implementation), _initData(treasury, address(0), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS)
        );
    }

    function test_initialize_revertsOnFeesTooHigh() public {
        Commerce implementation = new Commerce();
        vm.expectRevert(ERC8183.FeesTooHigh.selector);
        new ERC1967Proxy(address(implementation), _initData(treasury, payoutToken, 9000, 1001));
    }

    function test_initialize_cannotBeCalledTwice() public {
        vm.expectRevert();
        commerce.initialize(treasury, payoutToken, PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_implementation_cannotBeInitializedDirectly() public {
        Commerce implementation = new Commerce();
        vm.expectRevert();
        implementation.initialize(treasury, payoutToken, PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
    }

    function test_legacyTwoArgInitialize_isDisabled() public {
        Commerce implementation = new Commerce();
        vm.expectRevert();
        implementation.initialize(treasury, notAdmin);
    }
}
