// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DeviceRegistry} from "../src/DeviceRegistry.sol";

/// @dev Standalone: DeviceRegistry isn't wired into DataCommerce/escrow yet, so this
///      doesn't share BaseTest's fixture stack.
contract DeviceRegistryTest is Test {
    DeviceRegistry internal registry;

    uint256 internal signerPk = 0xD0D;
    address internal signer;
    address internal relayer = makeAddr("relayer");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant AUTH_WINDOW = 1 hours;

    bytes32 internal constant DEVICE_ID = keccak256("device-1");

    function setUp() public {
        registry = new DeviceRegistry();
        signer = vm.addr(signerPk);
    }

    function _auth(bytes32 deviceId, uint72 nonce, uint256 deadline)
        internal
        view
        returns (DeviceRegistry.Authorization memory)
    {
        bytes32 structHash = keccak256(
            abi.encode(registry.REGISTER_DEVICE_AUTHORIZATION_TYPEHASH(), signer, deviceId, nonce, deadline)
        );
        bytes32 domainSeparator = _domainSeparator();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);

        return DeviceRegistry.Authorization({
            signer: signer, nonce: nonce, deadline: deadline, sig: abi.encodePacked(r, s, v)
        });
    }

    function _domainSeparator() internal view returns (bytes32) {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract,,) =
            registry.eip712Domain();
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                verifyingContract
            )
        );
    }

    // ──────────────────── Direct registration ────────────────────

    function test_registerDeviceEmitsCallerAsRegistrant() public {
        vm.expectEmit(true, true, false, true, address(registry));
        emit DeviceRegistry.DeviceRegistered(stranger, DEVICE_ID, block.timestamp);

        vm.prank(stranger);
        registry.registerDevice(DEVICE_ID);
    }

    function test_registerDeviceAllowsAnyCallerForSameDeviceId() public {
        vm.prank(stranger);
        registry.registerDevice(DEVICE_ID);

        // Storage-free and permissionless: a second, unrelated caller can register the
        // same deviceId without reverting — this is a self-reported signal, not a claim.
        vm.prank(signer);
        registry.registerDevice(DEVICE_ID);
    }

    // ──────────────────── Signature-authorized registration ────────────────────

    function test_registerDeviceWithAuthorizationEmitsSignerAsRegistrant() public {
        DeviceRegistry.Authorization memory auth = _auth(DEVICE_ID, 1, block.timestamp + AUTH_WINDOW);

        vm.expectEmit(true, true, false, true, address(registry));
        emit DeviceRegistry.DeviceRegistered(signer, DEVICE_ID, block.timestamp);

        vm.prank(relayer);
        registry.registerDeviceWithAuthorization(DEVICE_ID, auth);
    }

    function test_revertsOnInvalidSignature() public {
        DeviceRegistry.Authorization memory auth = _auth(DEVICE_ID, 1, block.timestamp + AUTH_WINDOW);
        auth.signer = stranger; // signature was produced by `signer`, not `stranger`

        vm.prank(relayer);
        vm.expectRevert(DeviceRegistry.InvalidAuthorizationSignature.selector);
        registry.registerDeviceWithAuthorization(DEVICE_ID, auth);
    }

    function test_revertsOnTamperedDeviceId() public {
        DeviceRegistry.Authorization memory auth = _auth(DEVICE_ID, 1, block.timestamp + AUTH_WINDOW);

        vm.prank(relayer);
        vm.expectRevert(DeviceRegistry.InvalidAuthorizationSignature.selector);
        registry.registerDeviceWithAuthorization(keccak256("device-2"), auth);
    }

    function test_revertsOnReusedNonce() public {
        DeviceRegistry.Authorization memory auth = _auth(DEVICE_ID, 7, block.timestamp + AUTH_WINDOW);

        vm.prank(relayer);
        registry.registerDeviceWithAuthorization(DEVICE_ID, auth);

        vm.prank(relayer);
        vm.expectRevert(DeviceRegistry.AuthorizationNonceUsed.selector);
        registry.registerDeviceWithAuthorization(DEVICE_ID, auth);
    }

    function test_revertsOnExpiredAuthorization() public {
        DeviceRegistry.Authorization memory auth = _auth(DEVICE_ID, 1, block.timestamp + AUTH_WINDOW);
        vm.warp(block.timestamp + AUTH_WINDOW + 1);

        vm.prank(relayer);
        vm.expectRevert(DeviceRegistry.AuthorizationExpired.selector);
        registry.registerDeviceWithAuthorization(DEVICE_ID, auth);
    }

    function test_sameSignerCanReuseDeviceIdWithFreshNonce() public {
        DeviceRegistry.Authorization memory first = _auth(DEVICE_ID, 1, block.timestamp + AUTH_WINDOW);
        vm.prank(relayer);
        registry.registerDeviceWithAuthorization(DEVICE_ID, first);

        DeviceRegistry.Authorization memory second = _auth(DEVICE_ID, 2, block.timestamp + AUTH_WINDOW);
        vm.prank(relayer);
        registry.registerDeviceWithAuthorization(DEVICE_ID, second);
    }
}
