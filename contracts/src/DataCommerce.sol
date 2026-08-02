// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {ERC8183WithAuthorization} from "erc-8183/contracts/ERC8183WithAuthorization.sol";

/**
 * @title DataCommerce
 * @notice Thin application layer over an unmodified ERC-8183 escrow.
 *
 * @dev Role mapping on the escrow:
 *      - client   = the buyer, established from their EIP-712 signature (never this contract)
 *      - provider = THIS CONTRACT. Provider-only actions (setBudget, setPayoutReceiver,
 *                   submit, claims) therefore need no signature — plain calls suffice —
 *                   and because this contract has no private key, they can only ever be
 *                   reached through the role-gated methods below. That is what makes
 *                   "payouts always land at treasury" an on-chain invariant rather than
 *                   a trusted-key convention.
 *      - evaluator = a separate address (the escrow forbids evaluator == provider), so
 *                   complete/reject on a funded job are NOT proxied here. That key calls
 *                   the escrow directly, or relays its own signed authorization.
 *
 *      Escrow-side configuration (fees, platformTreasury, payment-token allowlist, pause)
 *      lives on the escrow and is managed by its admin — not here.
 */
contract DataCommerce is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    /// @notice May relay job creation and drive provider-side actions.
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");

    /// @notice The ERC-8183 escrow this application operates against.
    ERC8183WithAuthorization public commerce;
    /// @notice Receives every provider-side payout. Pinned on each job at creation.
    address public treasury;
    /// @notice ERC-20 used as the budget token for jobs created here.
    address public payoutToken;
    /// @notice Evaluator named on every job created here. Must differ from this contract.
    address public evaluator;

    /// @notice Emitted for each job this contract created and configured
    event DataJobCreated(uint256 indexed jobId, address indexed client, uint256 budget);
    /// @notice Emitted when the escrow address is set or updated
    event CommerceUpdated(address indexed commerce);
    /// @notice Emitted when the payout treasury is set or updated
    event TreasuryUpdated(address indexed treasury);
    /// @notice Emitted when the budget token is set or updated
    event PayoutTokenUpdated(address indexed payoutToken);
    /// @notice Emitted when the evaluator is set or updated
    event EvaluatorUpdated(address indexed evaluator);

    /// @notice Thrown when a required address parameter is address(0)
    error ZeroAddress();
    /// @notice Thrown when the evaluator would equal this contract, which the escrow forbids
    error EvaluatorCannotBeProvider();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the adapter.
    /// @dev admin_ is explicit rather than msg.sender: during proxy construction msg.sender
    ///      is whoever deployed the proxy, which is the wrong account behind a factory.
    /// @param commerce_     The ERC-8183 escrow to operate against
    /// @param treasury_     Receives every provider-side payout
    /// @param payoutToken_  ERC-20 used as the job budget token (must be allowlisted on the escrow)
    /// @param evaluator_    Evaluator named on every job created here
    /// @param admin_        Granted DEFAULT_ADMIN_ROLE and the initial PROVIDER_ROLE
    function initialize(address commerce_, address treasury_, address payoutToken_, address evaluator_, address admin_)
        public
        initializer
    {
        if (commerce_ == address(0)) revert ZeroAddress();
        if (treasury_ == address(0)) revert ZeroAddress();
        if (payoutToken_ == address(0)) revert ZeroAddress();
        if (evaluator_ == address(0)) revert ZeroAddress();
        if (admin_ == address(0)) revert ZeroAddress();
        if (evaluator_ == address(this)) revert EvaluatorCannotBeProvider();

        // UUPSUpgradeable carries no initializer in OZ v5 — it is not Initializable.
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(PROVIDER_ROLE, admin_);

        commerce = ERC8183WithAuthorization(commerce_);
        emit CommerceUpdated(commerce_);

        treasury = treasury_;
        emit TreasuryUpdated(treasury_);

        payoutToken = payoutToken_;
        emit PayoutTokenUpdated(payoutToken_);

        evaluator = evaluator_;
        emit EvaluatorUpdated(evaluator_);
    }

    /// @notice Authorize contract upgrades, restricted to DEFAULT_ADMIN_ROLE
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ──────────────────── Admin ────────────────────

    /// @notice Points the adapter at a different escrow.
    /// @dev Jobs already created live on the previous escrow and become unreachable
    ///      through this contract. Only repoint before any jobs exist, or after draining.
    function setCommerce(address commerce_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (commerce_ == address(0)) revert ZeroAddress();
        commerce = ERC8183WithAuthorization(commerce_);
        emit CommerceUpdated(commerce_);
    }

    /// @notice Updates the payout treasury. Applies to jobs created after this call;
    ///         existing jobs keep the receiver pinned at their creation.
    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    /// @notice Updates the budget token used by future jobs.
    /// @dev Must be allowlisted on the escrow, or setBudget will revert PaymentTokenNotAllowed.
    function setPayoutToken(address payoutToken_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (payoutToken_ == address(0)) revert ZeroAddress();
        payoutToken = payoutToken_;
        emit PayoutTokenUpdated(payoutToken_);
    }

    /// @notice Updates the evaluator named on future jobs.
    function setEvaluator(address evaluator_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (evaluator_ == address(0)) revert ZeroAddress();
        if (evaluator_ == address(this)) revert EvaluatorCannotBeProvider();
        evaluator = evaluator_;
        emit EvaluatorUpdated(evaluator_);
    }

    // ──────────────────── Job creation ────────────────────

    /// @notice Creates a job from a buyer's signed authorization, then sets its budget and
    ///         pins its payout receiver to treasury — all in one transaction.
    /// @dev    provider is forced to address(this) and evaluator to the configured address.
    ///         Both are covered by the buyer's EIP-712 signature, so a buyer who signed
    ///         different values simply fails signature verification — no separate check needed.
    ///         Steps 2 and 3 need no signature because this contract IS the job's provider.
    /// @param expiredAt        Job expiry, as signed by the buyer
    /// @param description      Job description, as signed by the buyer
    /// @param hook             Hook contract, as signed by the buyer (address(0) for none)
    /// @param providerAgentId  Optional ERC-8004 agent id, as signed by the buyer
    /// @param budget           Budget in payoutToken units
    /// @param clientAuth       The buyer's EIP-712 authorization; clientAuth.signer becomes the client
    /// @return jobId The new job ID
    function createDataJob(
        uint48 expiredAt,
        string calldata description,
        address hook,
        uint256 providerAgentId,
        uint256 budget,
        ERC8183WithAuthorization.Authorization calldata clientAuth
    ) external onlyRole(PROVIDER_ROLE) returns (uint256 jobId) {
        ERC8183WithAuthorization.CreateJobAuthorizationParams memory params =
            ERC8183WithAuthorization.CreateJobAuthorizationParams({
                provider: address(this),
                evaluator: evaluator,
                expiredAt: expiredAt,
                description: description,
                hook: hook,
                providerAgentId: providerAgentId
            });

        jobId = commerce.createJobWithAuthorization(params, clientAuth);
        commerce.setBudget(jobId, payoutToken, budget, "");
        commerce.setPayoutReceiver(jobId, treasury);

        emit DataJobCreated(jobId, clientAuth.signer, budget);
    }

    // ──────────────────── Provider-side actions ────────────────────
    //
    // All of these are provider-only on the escrow. This contract is the provider, so they
    // are plain calls — no signatures — reachable only through these role-gated wrappers.

    /// @notice Updates a job's budget while it is still Open and unfunded.
    function setJobBudget(uint256 jobId, uint256 budget) external onlyRole(PROVIDER_ROLE) {
        commerce.setBudget(jobId, payoutToken, budget, "");
    }

    /// @notice Submits the deliverable for a funded job, moving it to Submitted.
    function submitJob(uint256 jobId, bytes32 deliverable) external onlyRole(PROVIDER_ROLE) {
        commerce.submit(jobId, deliverable, "");
    }

    /// @notice Files a milestone claim against a funded job for incremental settlement.
    /// @param cumulativeAmount Total released to date once this claim settles, not a delta
    function submitJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable)
        external
        onlyRole(PROVIDER_ROLE)
    {
        commerce.submitClaim(jobId, cumulativeAmount, deliverable, "");
    }

    /// @notice Withdraws this contract's own pending claim on a job.
    function withdrawJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable, bytes32 reason)
        external
        onlyRole(PROVIDER_ROLE)
    {
        commerce.rejectClaim(jobId, cumulativeAmount, deliverable, reason, "");
    }

    /// @notice Cancels a job that is still Open. The escrow permits the provider to reject
    ///         only in the Open state; once funded, rejection is the evaluator's call.
    function rejectOpenJob(uint256 jobId, bytes32 reason) external onlyRole(PROVIDER_ROLE) {
        commerce.reject(jobId, reason, "");
    }

    // ──────────────────── Views ────────────────────

    /// @notice Reads a job from the escrow.
    function getJob(uint256 jobId) external view returns (ERC8183.Job memory) {
        return commerce.getJob(jobId);
    }
}
