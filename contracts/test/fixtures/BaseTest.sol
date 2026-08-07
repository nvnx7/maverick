// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AgenticCommerce} from "../../src/AgenticCommerce.sol";
import {DataCommerce} from "../../src/DataCommerce.sol";
import {FundDisburser} from "../../src/FundDisburser.sol";
import {ProviderAgent} from "../../src/agents/ProviderAgent.sol";
import {EvaluatorAgent} from "../../src/agents/EvaluatorAgent.sol";
import {Fixtures} from "./Fixtures.sol";

abstract contract BaseTest is Fixtures {
    AgenticCommerce internal escrow;
    DataCommerce internal dc;
    FundDisburser internal fundDisburser;
    ProviderAgent internal providerAgent;
    EvaluatorAgent internal evaluatorAgent;

    uint48 internal expiredAt;
    uint72 internal clientNonce;

    function setUp() public virtual {
        escrow = _deployEscrow();

        vm.startPrank(admin);
        escrow.setPaymentTokenAllowed(address(paymentToken), true);
        escrow.setPlatformFee(PLATFORM_FEE_BPS, treasury);
        escrow.setEvaluatorFee(EVALUATOR_FEE_BPS);
        vm.stopPrank();

        fundDisburser = new FundDisburser(address(escrow));
        dc = _deployEntrypoint(address(escrow), address(fundDisburser), treasury, address(paymentToken));
        (providerAgent, evaluatorAgent) = _deployAgents(dc);

        vm.prank(admin);
        dc.setAgents(address(providerAgent), address(evaluatorAgent));

        expiredAt = uint48(block.timestamp + JOB_DURATION);
    }

    // ──────────────────── Deployment ────────────────────

    function _deployEscrow() internal returns (AgenticCommerce) {
        AgenticCommerce implementation = new AgenticCommerce();
        vm.prank(admin);
        return AgenticCommerce(
            address(
                new ERC1967Proxy(
                    address(implementation), abi.encodeWithSignature("initialize(address,address)", treasury, admin)
                )
            )
        );
    }

    /// @dev Kept separate from setUp so initialize-validation tests can deploy independently
    ///      and arm vm.expectRevert immediately before the failing call.
    function _deployEntrypoint(address commerce_, address fundDisburser_, address treasury_, address payoutToken_)
        internal
        returns (DataCommerce)
    {
        DataCommerce implementation = new DataCommerce();
        return DataCommerce(
            address(
                new ERC1967Proxy(
                    address(implementation), _initData(commerce_, fundDisburser_, treasury_, payoutToken_)
                )
            )
        );
    }

    function _initData(address commerce_, address fundDisburser_, address treasury_, address payoutToken_)
        internal
        view
        returns (bytes memory)
    {
        return abi.encodeWithSignature(
            "initialize(address,address,address,address,address,address,address)",
            commerce_,
            fundDisburser_,
            treasury_,
            payoutToken_,
            admin,
            providerOperator,
            evaluatorOperator
        );
    }

    /// @dev Agents take the entrypoint address in their constructor, so they can only be
    ///      deployed once the entrypoint proxy exists.
    function _deployAgents(DataCommerce entrypoint) internal returns (ProviderAgent, EvaluatorAgent) {
        return (
            new ProviderAgent(address(escrow), address(entrypoint)),
            new EvaluatorAgent(address(escrow), address(entrypoint))
        );
    }

    // ──────────────────── Authorization ────────────────────

    function _clientAuth(uint48 expiredAt_, string memory description, uint72 nonce)
        internal
        view
        returns (AgenticCommerce.Authorization memory)
    {
        return _clientAuthFor(address(providerAgent), address(evaluatorAgent), expiredAt_, description, nonce);
    }

    function _clientAuthFor(
        address provider_,
        address evaluator_,
        uint48 expiredAt_,
        string memory description,
        uint72 nonce
    ) internal view returns (AgenticCommerce.Authorization memory) {
        uint256 deadline = block.timestamp + AUTH_WINDOW;
        bytes32 structHash = keccak256(
            abi.encode(
                escrow.CREATE_JOB_AUTHORIZATION_TYPEHASH(),
                buyer,
                provider_,
                evaluator_,
                expiredAt_,
                keccak256(bytes(description)),
                address(0),
                uint256(0),
                nonce,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(buyerPk, digest);

        return AgenticCommerce.Authorization({
            signer: buyer, nonce: nonce, deadline: deadline, sig: abi.encodePacked(r, s, v)
        });
    }

    // ──────────────────── Job lifecycle helpers ────────────────────

    function _params(uint48 expiredAt_, string memory description, uint256 budget)
        internal
        pure
        returns (DataCommerce.CreateDataJobParams memory)
    {
        return DataCommerce.CreateDataJobParams({
            expiredAt: expiredAt_, description: description, hook: address(0), providerAgentId: 0
        });
    }

    function _createJob() internal returns (uint256 jobId) {
        return _createJobWithBudget(BUDGET);
    }

    function _createJobWithBudget(uint256 budget) internal returns (uint256 jobId) {
        // Sign before pranking: the helper reads from the escrow, which would consume the prank.
        AgenticCommerce.Authorization memory auth = _clientAuth(expiredAt, "data job", ++clientNonce);

        vm.prank(providerOperator);
        jobId = dc.createDataJob(_params(expiredAt, "data job", budget), auth);
    }

    function _fund(uint256 jobId, uint256 budget) internal {
        paymentToken.mint(buyer, budget);
        vm.startPrank(buyer);
        paymentToken.approve(address(escrow), budget);
        escrow.fund(jobId, address(paymentToken), budget, "");
        vm.stopPrank();
    }

    function _createFundedJob() internal returns (uint256 jobId) {
        jobId = _createJob();
        _fund(jobId, BUDGET);
    }

    function _submit(uint256 jobId) internal {
        vm.prank(providerOperator);
        dc.submitJob(jobId, keccak256("deliverable"));
    }

    function _createSubmittedJob() internal returns (uint256 jobId) {
        jobId = _createFundedJob();
        _submit(jobId);
    }

    function _complete(uint256 jobId) internal {
        vm.prank(evaluatorOperator);
        dc.completeJob(jobId, bytes32("approved"), contributor);
    }
}
