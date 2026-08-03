// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IDisburser} from "erc-8183/contracts/IDisburser.sol";

/// @notice Payout receiver that forwards a job's provider-side net amount to the
///         contributor named in the triggering call's optParams.
/// @dev The escrow transfers the funds here and then calls onDisbursement, so this
///      contract already holds `amount` when it runs and should end at a zero balance.
contract FundDisburser is IDisburser, ERC165 {
    using SafeERC20 for IERC20;

    /// @notice The only address permitted to trigger a disbursement.
    address public immutable escrow;

    event FundsDisbursed(uint256 indexed jobId, address indexed contributor, address indexed token, uint256 amount);

    error ZeroAddress();
    error NotEscrow();
    error InvalidContributorData();

    constructor(address escrow_) {
        if (escrow_ == address(0)) revert ZeroAddress();
        escrow = escrow_;
    }

    /// @inheritdoc IDisburser
    /// @dev `data` must be a single abi-encoded contributor address. Reverting here
    ///      reverts the escrow call that triggered it, so a job carrying malformed
    ///      optParams cannot be completed until they are corrected.
    function onDisbursement(uint256 jobId, bytes4, address token, uint256 amount, bytes calldata data) external {
        if (msg.sender != escrow) revert NotEscrow();

        address contributor = _decodeContributor(data);
        if (amount > 0) {
            IERC20(token).safeTransfer(contributor, amount);
        }

        emit FundsDisbursed(jobId, contributor, token, amount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IDisburser).interfaceId || super.supportsInterface(interfaceId);
    }

    function _decodeContributor(bytes calldata data) private pure returns (address contributor) {
        if (data.length != 32) revert InvalidContributorData();
        contributor = abi.decode(data, (address));
        if (contributor == address(0)) revert InvalidContributorData();
    }
}
