// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {ERC8183WithAuthorization} from "erc-8183/contracts/ERC8183WithAuthorization.sol";
import {MockUSDC} from "erc-8183/contracts/mocks/MockUSDC.sol";
import {DataCommerce} from "../src/DataCommerce.sol";

contract SmokeTest is Test {
    ERC8183WithAuthorization internal escrow;
    DataCommerce internal dc;
    MockUSDC internal token;

    address internal admin = makeAddr("admin");
    address internal treasury = makeAddr("treasury");
    address internal evaluator = makeAddr("evaluator");
    uint256 internal buyerPk = 0xB0B;
    address internal buyer;

    uint256 internal constant BUDGET = 1_000e6;

    function setUp() public {
        buyer = vm.addr(buyerPk);
        token = new MockUSDC();

        ERC8183WithAuthorization escrowImpl = new ERC8183WithAuthorization();
        vm.prank(admin);
        ERC1967Proxy escrowProxy = new ERC1967Proxy(
            address(escrowImpl), abi.encodeWithSignature("initialize(address,address)", treasury, admin)
        );
        escrow = ERC8183WithAuthorization(address(escrowProxy));

        vm.prank(admin);
        escrow.setPaymentTokenAllowed(address(token), true);

        DataCommerce dcImpl = new DataCommerce();
        vm.prank(admin);
        ERC1967Proxy dcProxy = new ERC1967Proxy(
            address(dcImpl),
            abi.encodeWithSignature(
                "initialize(address,address,address,address,address)",
                address(escrow),
                treasury,
                address(token),
                evaluator,
                admin
            )
        );
        dc = DataCommerce(address(dcProxy));
    }

    function _signCreate(uint48 expiredAt, string memory description, uint72 nonce)
        internal
        view
        returns (ERC8183WithAuthorization.Authorization memory auth)
    {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 structHash = keccak256(
            abi.encode(
                escrow.CREATE_JOB_AUTHORIZATION_TYPEHASH(),
                buyer,
                address(dc), // provider is the adapter
                evaluator,
                expiredAt,
                keccak256(bytes(description)),
                address(0), // hook
                uint256(0), // providerAgentId
                nonce,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(buyerPk, digest);
        auth = ERC8183WithAuthorization.Authorization({
            signer: buyer,
            nonce: nonce,
            deadline: deadline,
            sig: abi.encodePacked(r, s, v)
        });
    }

    function _createJob() internal returns (uint256 jobId) {
        uint48 expiredAt = uint48(block.timestamp + 7 days);
        // Sign before pranking: _signCreate calls into the escrow, which would consume the prank.
        ERC8183WithAuthorization.Authorization memory auth = _signCreate(expiredAt, "data job", 1);

        vm.prank(admin);
        jobId = dc.createDataJob(expiredAt, "data job", address(0), 0, BUDGET, auth);
    }

    /// One transaction sets client, provider, evaluator, token, budget and payout receiver.
    function test_createDataJob_configuresEverythingInOneCall() public {
        uint256 jobId = _createJob();

        ERC8183.Job memory job = escrow.getJob(jobId);
        assertEq(job.client, buyer, "client is the signer, not the relayer");
        assertEq(job.provider, address(dc), "adapter is the provider");
        assertEq(job.evaluator, evaluator, "evaluator");
        assertEq(job.paymentToken, address(token), "payment token");
        assertEq(job.budget, BUDGET, "budget");
        assertEq(job.payoutReceiver, treasury, "payout pinned to treasury");
        assertEq(uint8(job.status), uint8(ERC8183.JobStatus.Open), "status");
    }

    /// Buyer funds the escrow directly — the adapter never custodies tokens.
    function test_fullLifecycle_payoutLandsAtTreasury() public {
        uint256 jobId = _createJob();

        token.mint(buyer, BUDGET);
        vm.startPrank(buyer);
        token.approve(address(escrow), BUDGET);
        escrow.fund(jobId, address(token), BUDGET, "");
        vm.stopPrank();

        assertEq(token.balanceOf(address(dc)), 0, "adapter holds no funds");

        vm.prank(admin);
        dc.submitJob(jobId, keccak256("deliverable"));

        vm.prank(evaluator);
        escrow.complete(jobId, bytes32("approved"), "");

        assertEq(uint8(escrow.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(token.balanceOf(treasury), BUDGET, "entire budget routed to treasury");
        assertEq(token.balanceOf(address(dc)), 0, "adapter still holds nothing");
    }

    /// Refunds return to the buyer, so no adapter-side ledger is needed.
    function test_refundGoesToBuyerNotAdapter() public {
        uint256 jobId = _createJob();

        token.mint(buyer, BUDGET);
        vm.startPrank(buyer);
        token.approve(address(escrow), BUDGET);
        escrow.fund(jobId, address(token), BUDGET, "");
        vm.stopPrank();

        vm.prank(evaluator);
        escrow.reject(jobId, bytes32("bad spec"), "");

        assertEq(token.balanceOf(buyer), BUDGET, "refund returned to buyer");
        assertEq(token.balanceOf(address(dc)), 0);
    }

    /// The payout invariant is structural: nobody holds the provider key.
    function test_payoutReceiverCannotBeRedirected() public {
        uint256 jobId = _createJob();

        // Not the provider — the escrow rejects everyone else outright.
        vm.prank(buyer);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        escrow.setPayoutReceiver(jobId, buyer);

        vm.prank(admin);
        vm.expectRevert(ERC8183.Unauthorized.selector);
        escrow.setPayoutReceiver(jobId, admin);

        assertEq(escrow.getJob(jobId).payoutReceiver, treasury);
    }

    /// A buyer signature naming a different provider/evaluator simply fails verification.
    function test_signatureBindsProviderAndEvaluator() public {
        uint48 expiredAt = uint48(block.timestamp + 7 days);
        uint256 deadline = block.timestamp + 1 hours;

        // Buyer signs with a rogue evaluator; the adapter still submits its configured one.
        bytes32 structHash = keccak256(
            abi.encode(
                escrow.CREATE_JOB_AUTHORIZATION_TYPEHASH(),
                buyer,
                address(dc),
                makeAddr("rogueEvaluator"),
                expiredAt,
                keccak256(bytes("data job")),
                address(0),
                uint256(0),
                uint72(7),
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(buyerPk, digest);

        ERC8183WithAuthorization.Authorization memory auth = ERC8183WithAuthorization.Authorization({
            signer: buyer,
            nonce: 7,
            deadline: deadline,
            sig: abi.encodePacked(r, s, v)
        });

        vm.prank(admin);
        vm.expectRevert(ERC8183WithAuthorization.InvalidAuthorizationSignature.selector);
        dc.createDataJob(expiredAt, "data job", address(0), 0, BUDGET, auth);
    }

    function test_createDataJob_requiresProviderRole() public {
        uint48 expiredAt = uint48(block.timestamp + 7 days);
        // Build the signature before arming expectRevert — _signCreate makes view calls
        // to the escrow, which would otherwise consume the expectation.
        ERC8183WithAuthorization.Authorization memory auth = _signCreate(expiredAt, "data job", 1);

        vm.prank(makeAddr("stranger"));
        vm.expectRevert();
        dc.createDataJob(expiredAt, "data job", address(0), 0, BUDGET, auth);
    }
}
