// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/// @title DeviceRegistry
/// @notice Registry of contributor device identities. Anyone can register any deviceId,
/// either directly or on behalf of a signer via an EIP-712 authorization. Storage 
/// free by design — a registration is just an emitted event for now - may change 
/// in future.
contract DeviceRegistry is EIP712 {
    string internal constant EIP712_NAME = "DeviceRegistry";
    string internal constant EIP712_VERSION = "1";

    bytes32 public constant REGISTER_DEVICE_AUTHORIZATION_TYPEHASH =
        keccak256("RegisterDeviceAuthorization(address signer,bytes32 deviceId,uint72 nonce,uint256 deadline)");

    /// @notice Tracks used packed nonces: uint160(signer) in the upper 160 bits, 24 zero padding bits, then uint72 nonce.
    mapping(bytes32 => bool) public authorizationNonceUsed;

    struct Authorization {
        address signer;
        uint72 nonce;
        uint256 deadline;
        bytes sig;
    }

    event DeviceRegistered(address indexed registrant, bytes32 indexed deviceId, uint256 timestamp);

    error AuthorizationExpired();
    error AuthorizationNonceUsed();
    error InvalidAuthorizationSignature();

    constructor() EIP712(EIP712_NAME, EIP712_VERSION) {}

    /// @notice Registers a device directly; the caller is recorded as the registrant.
    function registerDevice(bytes32 deviceId) external {
        _registerDevice(msg.sender, deviceId);
    }

    /// @notice Registers a device on `auth.signer`'s behalf, authorized off-chain via
    ///         EIP-712. Lets a relayer submit the transaction while the signer stays gasless.
    function registerDeviceWithAuthorization(bytes32 deviceId, Authorization calldata auth) external {
        _verifyAuthorization(
            auth.signer,
            auth.nonce,
            auth.deadline,
            keccak256(
                abi.encode(REGISTER_DEVICE_AUTHORIZATION_TYPEHASH, auth.signer, deviceId, auth.nonce, auth.deadline)
            ),
            auth.sig
        );
        _registerDevice(auth.signer, deviceId);
    }

    /// @dev Both public entrypoints funnel through here so the event shape can only drift
    ///      in one place.
    function _registerDevice(address registrant, bytes32 deviceId) internal {
        emit DeviceRegistered(registrant, deviceId, block.timestamp);
    }

    function _verifyAuthorization(
        address signer,
        uint72 nonce,
        uint256 deadline,
        bytes32 structHash,
        bytes calldata sig
    ) internal {
        if (block.timestamp > deadline) revert AuthorizationExpired();
        bytes32 packedNonce = _packAuthorizationNonce(signer, nonce);
        if (authorizationNonceUsed[packedNonce]) revert AuthorizationNonceUsed();
        authorizationNonceUsed[packedNonce] = true;
        bytes32 digest = _hashTypedDataV4(structHash);
        if (!SignatureChecker.isValidSignatureNowCalldata(signer, digest, sig)) revert InvalidAuthorizationSignature();
    }

    function _packAuthorizationNonce(address signer, uint72 nonce) internal pure returns (bytes32) {
        return bytes32((uint256(uint160(signer)) << 96) | uint256(nonce));
    }
}
