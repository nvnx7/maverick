// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {ERC8183} from "erc-8183/contracts/ERC8183.sol";

/// @title AgenticCommerce
/// @notice ERC8183 escrow with signed authorization for job creation only. Every other
///         lifecycle action (fund, submit, complete, reject, claims, ...) is called directly
///         by its role-gated caller, so this contract skips the ~11 other WithAuthorization
///         variants that ERC8183WithAuthorization carries for actions we never route through
///         a signature.
contract AgenticCommerce is ERC8183 {
    bytes32 public constant CREATE_JOB_AUTHORIZATION_TYPEHASH = keccak256(
        "CreateJobAuthorization(address signer,address provider,address evaluator,uint48 expiredAt,bytes32 descriptionHash,address hook,uint256 providerAgentId,uint72 nonce,uint256 deadline)"
    );

    /// @notice Tracks used packed nonces: uint160(signer) in the upper 160 bits, 24 zero padding bits, then uint72 nonce.
    mapping(bytes32 => bool) public authorizationNonceUsed;
    /// @dev Storage gap for future AgenticCommerce state variable additions without colliding with derived contracts.
    uint256[50] private __authorizationGap;

    struct Authorization {
        address signer;
        uint72 nonce;
        uint256 deadline;
        bytes sig;
    }

    struct CreateJobAuthorizationParams {
        address provider;
        address evaluator;
        uint48 expiredAt;
        string description;
        address hook;
        uint256 providerAgentId;
    }

    event AuthorizationUsed(address indexed signer, bytes32 indexed nonce);
    event AuthorizationCanceled(address indexed signer, bytes32 indexed nonce);

    error AuthorizationExpired();
    error AuthorizationNonceUsed();
    error InvalidAuthorizationSignature();

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @notice Burns one of msg.sender's authorization nonces so a signed authorization cannot be relayed later.
    /// @dev This is intentionally not relayed: only the signer can nullify their own outstanding authorization.
    ///      It is deliberately callable while paused so signers can revoke outstanding signatures during incidents.
    function cancelAuthorization(uint72 nonce) external nonReentrant {
        bytes32 packedNonce = _packAuthorizationNonce(msg.sender, nonce);
        if (authorizationNonceUsed[packedNonce]) revert AuthorizationNonceUsed();
        authorizationNonceUsed[packedNonce] = true;
        emit AuthorizationCanceled(msg.sender, packedNonce);
    }

    function createJobWithAuthorization(
        CreateJobAuthorizationParams calldata params,
        Authorization calldata auth
    ) external whenNotPaused nonReentrant returns (uint256) {
        _verifyAuthorization(
            auth.signer,
            auth.nonce,
            auth.deadline,
            keccak256(
                abi.encode(
                    CREATE_JOB_AUTHORIZATION_TYPEHASH,
                    auth.signer,
                    params.provider,
                    params.evaluator,
                    params.expiredAt,
                    keccak256(bytes(params.description)),
                    params.hook,
                    params.providerAgentId,
                    auth.nonce,
                    auth.deadline
                )
            ),
            auth.sig
        );
        return _createJob(
            auth.signer,
            params.provider,
            params.evaluator,
            params.expiredAt,
            params.description,
            params.hook,
            params.providerAgentId
        );
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
        emit AuthorizationUsed(signer, packedNonce);
    }

    function _packAuthorizationNonce(address signer, uint72 nonce) internal pure returns (bytes32) {
        return bytes32((uint256(uint160(signer)) << 96) | uint256(nonce));
    }
}
