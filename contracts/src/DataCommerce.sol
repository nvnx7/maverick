// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {AgenticCommerce} from "./AgenticCommerce.sol";
import {BaseAgent} from "./agents/BaseAgent.sol";
import {ProviderAgent} from "./agents/ProviderAgent.sol";
import {EvaluatorAgent} from "./agents/EvaluatorAgent.sol";

/// @notice Entrypoint for this application's ERC-8183 jobs.
/// @dev The buyer is the job's client, established from their EIP-712 signature. The
///      provider and evaluator seats are held by two keyless agent contracts driven from
///      here, so every privileged action is routed through one role-gated surface and the
///      payout receiver can only ever be treasury.
contract DataCommerce is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");

    AgenticCommerce public commerce;
    ProviderAgent public providerAgent;
    EvaluatorAgent public evaluatorAgent;
    address public treasury;
    address public payoutToken;

    struct CreateDataJobParams {
        uint48 expiredAt;
        string description;
        address hook;
        uint256 providerAgentId;
        uint256 budget;
    }

    event DataJobCreated(uint256 indexed jobId, address indexed client, uint256 budget);
    event CommerceUpdated(address indexed commerce);
    event AgentsUpdated(address indexed providerAgent, address indexed evaluatorAgent);
    event TreasuryUpdated(address indexed treasury);
    event PayoutTokenUpdated(address indexed payoutToken);

    error ZeroAddress();
    error AgentsNotSet();
    error AgentsMustDiffer();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Agents are wired after deployment via setAgents: they need this proxy's address
    ///      in their constructor, so they cannot exist yet at initialization.
    /// @param provider_  Operator granted PROVIDER_ROLE; drives the ProviderAgent
    /// @param evaluator_ Operator granted EVALUATOR_ROLE; drives the EvaluatorAgent
    function initialize(
        address commerce_,
        address treasury_,
        address payoutToken_,
        address admin_,
        address provider_,
        address evaluator_
    ) public initializer {
        if (admin_ == address(0) || provider_ == address(0) || evaluator_ == address(0)) {
            revert ZeroAddress();
        }

        __AccessControl_init();

        _setCommerce(commerce_);
        _setTreasury(treasury_);
        _setPayoutToken(payoutToken_);

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(PROVIDER_ROLE, provider_);
        _grantRole(EVALUATOR_ROLE, evaluator_);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ──────────────────── Internal setters ────────────────────

    function _setCommerce(address commerce_) internal {
        if (commerce_ == address(0)) revert ZeroAddress();
        commerce = AgenticCommerce(commerce_);
        emit CommerceUpdated(commerce_);
    }

    function _setTreasury(address treasury_) internal {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function _setPayoutToken(address payoutToken_) internal {
        if (payoutToken_ == address(0)) revert ZeroAddress();
        payoutToken = payoutToken_;
        emit PayoutTokenUpdated(payoutToken_);
    }

    function _setAgents(address providerAgent_, address evaluatorAgent_) internal {
        if (providerAgent_ == address(0) || evaluatorAgent_ == address(0)) revert ZeroAddress();
        if (providerAgent_ == evaluatorAgent_) revert AgentsMustDiffer();
        providerAgent = ProviderAgent(providerAgent_);
        evaluatorAgent = EvaluatorAgent(evaluatorAgent_);
        emit AgentsUpdated(providerAgent_, evaluatorAgent_);
    }

    function _sweep(BaseAgent agent, address token) internal {
        uint256 balance = IERC20(token).balanceOf(address(agent));
        if (balance > 0) agent.sweep(token, treasury, balance);
    }

    // ──────────────────── Admin ────────────────────

    function setCommerce(address commerce_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setCommerce(commerce_);
    }

    /// @dev Agent addresses are written into existing jobs. Repointing strands any job
    ///      still in flight against the previous pair.
    function setAgents(address providerAgent_, address evaluatorAgent_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setAgents(providerAgent_, evaluatorAgent_);
    }

    /// @dev Applies to jobs created after this call; existing jobs keep their pinned receiver.
    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTreasury(treasury_);
    }

    /// @dev Must be allowlisted on the escrow or setBudget reverts PaymentTokenNotAllowed.
    function setPayoutToken(address payoutToken_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setPayoutToken(payoutToken_);
    }

    /// @notice Moves both agents' balances of `token` to treasury, chiefly accrued evaluator fees.
    function sweepAgentBalances(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _sweep(providerAgent, token);
        _sweep(evaluatorAgent, token);
    }

    /// @notice Migrates both agents to a replacement entrypoint, preserving job continuity.
    function migrateAgents(address entrypoint_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        providerAgent.setEntrypoint(entrypoint_);
        evaluatorAgent.setEntrypoint(entrypoint_);
    }

    // ──────────────────── Job creation ────────────────────

    /// @notice Creates a job from the buyer's authorization, then sets its budget and pins
    ///         its payout receiver to treasury, in one transaction.
    /// @dev Provider and evaluator are forced to the agents and are covered by the buyer's
    ///      signature, so a buyer who signed anything else fails verification.
    function createDataJob(
        CreateDataJobParams calldata params,
        AgenticCommerce.Authorization calldata clientAuth
    ) external onlyRole(PROVIDER_ROLE) returns (uint256 jobId) {
        if (address(providerAgent) == address(0) || address(evaluatorAgent) == address(0)) revert AgentsNotSet();

        AgenticCommerce.CreateJobAuthorizationParams memory createParams =
            AgenticCommerce.CreateJobAuthorizationParams({
                provider: address(providerAgent),
                evaluator: address(evaluatorAgent),
                expiredAt: params.expiredAt,
                description: params.description,
                hook: params.hook,
                providerAgentId: params.providerAgentId
            });

        jobId = commerce.createJobWithAuthorization(createParams, clientAuth);

        providerAgent.execute(abi.encodeCall(ERC8183.setBudget, (jobId, payoutToken, params.budget, "")));
        providerAgent.execute(abi.encodeCall(ERC8183.setPayoutReceiver, (jobId, treasury)));

        emit DataJobCreated(jobId, clientAuth.signer, params.budget);
    }

    // ──────────────────── Provider actions ────────────────────

    function setJobBudget(uint256 jobId, uint256 budget) external onlyRole(PROVIDER_ROLE) {
        providerAgent.execute(abi.encodeCall(ERC8183.setBudget, (jobId, payoutToken, budget, "")));
    }

    function submitJob(uint256 jobId, bytes32 deliverable) external onlyRole(PROVIDER_ROLE) {
        providerAgent.execute(abi.encodeCall(ERC8183.submit, (jobId, deliverable, "")));
    }

    /// @param cumulativeAmount Total released to date once settled, not a delta.
    function submitJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable)
        external
        onlyRole(PROVIDER_ROLE)
    {
        providerAgent.execute(abi.encodeCall(ERC8183.submitClaim, (jobId, cumulativeAmount, deliverable, "")));
    }

    function withdrawJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable, bytes32 reason)
        external
        onlyRole(PROVIDER_ROLE)
    {
        providerAgent.execute(abi.encodeCall(ERC8183.rejectClaim, (jobId, cumulativeAmount, deliverable, reason, "")));
    }

    /// @dev The escrow only lets the provider reject while a job is Open.
    function rejectOpenJob(uint256 jobId, bytes32 reason) external onlyRole(PROVIDER_ROLE) {
        providerAgent.execute(abi.encodeCall(ERC8183.reject, (jobId, reason, "")));
    }

    // ──────────────────── Evaluator actions ────────────────────

    function completeJob(uint256 jobId, bytes32 reason) external onlyRole(EVALUATOR_ROLE) {
        evaluatorAgent.execute(abi.encodeCall(ERC8183.complete, (jobId, reason, "")));
    }

    function rejectJob(uint256 jobId, bytes32 reason) external onlyRole(EVALUATOR_ROLE) {
        evaluatorAgent.execute(abi.encodeCall(ERC8183.reject, (jobId, reason, "")));
    }

    function approveJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable)
        external
        onlyRole(EVALUATOR_ROLE)
    {
        evaluatorAgent.execute(abi.encodeCall(ERC8183.approveClaim, (jobId, cumulativeAmount, deliverable, "")));
    }

    function rejectJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable, bytes32 reason)
        external
        onlyRole(EVALUATOR_ROLE)
    {
        evaluatorAgent.execute(abi.encodeCall(ERC8183.rejectClaim, (jobId, cumulativeAmount, deliverable, reason, "")));
    }

    // ──────────────────── Views ────────────────────

    function getJob(uint256 jobId) external view returns (ERC8183.Job memory) {
        return commerce.getJob(jobId);
    }
}
