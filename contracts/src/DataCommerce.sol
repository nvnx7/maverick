// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC8183} from "erc-8183/contracts/ERC8183.sol";

contract DataCommerce is ERC8183 {
    /// @dev Disabled — the 2-arg initializer inherited from ERC8183 skips payout
    ///      token/fee setup. Use initialize(address,address,uint256,uint256).
    function initialize(address, address) public pure override {
        revert("Disabled initializer");
    }

    function initialize(address treasury_, address payoutToken_, uint256 platformFeeBps_, uint256 evaluatorFeeBps_)
        public
        initializer
    {
        if (payoutToken_ == address(0)) revert ZeroAddress();
        if (platformFeeBps_ + evaluatorFeeBps_ > 10000) revert FeesTooHigh();

        __ERC8183_init(treasury_, msg.sender, "DataCommerce", "1");

        allowedPaymentTokens[payoutToken_] = true;
        emit PaymentTokenAllowlistUpdated(payoutToken_, true);

        platformFeeBP = platformFeeBps_;
        emit PlatformFeeUpdated(platformFeeBps_, treasury_);

        evaluatorFeeBP = evaluatorFeeBps_;
        emit EvaluatorFeeUpdated(evaluatorFeeBps_);
    }
}
