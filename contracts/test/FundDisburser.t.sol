// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Test} from "forge-std/Test.sol";
import {ERC8183} from "erc-8183/contracts/ERC8183.sol";
import {IDisburser} from "erc-8183/contracts/IDisburser.sol";
import {MockUSDC} from "erc-8183/contracts/mocks/MockUSDC.sol";
import {FundDisburser} from "../src/FundDisburser.sol";

contract FundDisburserTest is Test {
    ERC8183 internal escrow;
    FundDisburser internal disburser;
    MockUSDC internal token;

    address internal admin = makeAddr("admin");
    address internal treasury = makeAddr("treasury");
    address internal client = makeAddr("client");
    address internal provider = makeAddr("provider");
    address internal evaluator = makeAddr("evaluator");
    address internal contributor = makeAddr("contributor");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant BUDGET = 1_000e6;
    uint256 internal constant PLATFORM_FEE_BPS = 250;
    uint256 internal constant EVALUATOR_FEE_BPS = 500;
    uint48 internal expiredAt;

    function setUp() public {
        token = new MockUSDC();

        ERC8183 implementation = new ERC8183();
        vm.prank(admin);
        escrow = ERC8183(
            address(
                new ERC1967Proxy(
                    address(implementation),
                    abi.encodeWithSignature("initialize(address,address)", treasury, admin)
                )
            )
        );

        vm.startPrank(admin);
        escrow.setPaymentTokenAllowed(address(token), true);
        escrow.setPlatformFee(PLATFORM_FEE_BPS, treasury);
        escrow.setEvaluatorFee(EVALUATOR_FEE_BPS);
        vm.stopPrank();

        disburser = new FundDisburser(address(escrow));
        expiredAt = uint48(block.timestamp + 7 days);
    }

    function _netOf(uint256 amount) internal pure returns (uint256) {
        return amount - (amount * PLATFORM_FEE_BPS) / 10000 - (amount * EVALUATOR_FEE_BPS) / 10000;
    }

    /// @dev Drives the escrow directly: the payout receiver and optParams pass-through are
    ///      escrow-level features, and DataCommerce does not forward optParams today.
    function _fundedJob() internal returns (uint256 jobId) {
        vm.prank(client);
        jobId = escrow.createJob(provider, evaluator, expiredAt, "job", address(0), 0);

        vm.startPrank(provider);
        escrow.setPayoutReceiver(jobId, address(disburser));
        escrow.setBudget(jobId, address(token), BUDGET, "");
        vm.stopPrank();

        token.mint(client, BUDGET);
        vm.startPrank(client);
        token.approve(address(escrow), BUDGET);
        escrow.fund(jobId, address(token), BUDGET, "");
        vm.stopPrank();
    }

    /// @dev Stops one call short of completion so tests can arm cheatcodes against it.
    function _submittedJob() internal returns (uint256 jobId) {
        jobId = _fundedJob();
        vm.prank(provider);
        escrow.submit(jobId, keccak256("deliverable"), "");
    }

    function _completedJob(bytes memory optParams) internal returns (uint256 jobId) {
        jobId = _submittedJob();
        vm.prank(evaluator);
        escrow.complete(jobId, bytes32("approved"), optParams);
    }

    // ──────────────────── ERC165 ────────────────────

    /// The escrow skips the callback entirely unless this reports true, which would
    /// silently strand the payout inside this contract.
    function test_advertisesIDisburser() public view {
        assertTrue(disburser.supportsInterface(type(IDisburser).interfaceId));
        assertTrue(disburser.supportsInterface(type(IERC165).interfaceId));
        assertFalse(disburser.supportsInterface(bytes4(0xdeadbeef)));
    }

    // ──────────────────── Direct calls ────────────────────

    function test_forwardsFullAmountToContributor() public {
        token.mint(address(disburser), BUDGET);

        vm.prank(address(escrow));
        disburser.onDisbursement(1, bytes4(0), address(token), BUDGET, abi.encode(contributor));

        assertEq(token.balanceOf(contributor), BUDGET);
        assertEq(token.balanceOf(address(disburser)), 0, "ends with a zero balance");
    }

    function test_revertsForNonEscrowCaller() public {
        token.mint(address(disburser), BUDGET);

        vm.prank(stranger);
        vm.expectRevert(FundDisburser.NotEscrow.selector);
        disburser.onDisbursement(1, bytes4(0), address(token), BUDGET, abi.encode(contributor));
    }

    function test_revertsOnEmptyData() public {
        vm.prank(address(escrow));
        vm.expectRevert(FundDisburser.InvalidContributorData.selector);
        disburser.onDisbursement(1, bytes4(0), address(token), BUDGET, "");
    }

    function test_revertsOnZeroContributor() public {
        vm.prank(address(escrow));
        vm.expectRevert(FundDisburser.InvalidContributorData.selector);
        disburser.onDisbursement(1, bytes4(0), address(token), BUDGET, abi.encode(address(0)));
    }

    function test_revertsOnMalformedData() public {
        vm.prank(address(escrow));
        vm.expectRevert(FundDisburser.InvalidContributorData.selector);
        disburser.onDisbursement(1, bytes4(0), address(token), BUDGET, hex"1234");
    }

    function test_zeroAmountIsANoOp() public {
        vm.prank(address(escrow));
        disburser.onDisbursement(1, bytes4(0), address(token), 0, abi.encode(contributor));

        assertEq(token.balanceOf(contributor), 0);
    }

    function test_constructorRejectsZeroEscrow() public {
        vm.expectRevert(FundDisburser.ZeroAddress.selector);
        new FundDisburser(address(0));
    }

    // ──────────────────── End to end through the escrow ────────────────────

    function test_completePaysContributorNetOfFees() public {
        uint256 jobId = _completedJob(abi.encode(contributor));

        uint256 net = _netOf(BUDGET);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(ERC8183.JobStatus.Completed));
        assertEq(token.balanceOf(contributor), net, "contributor receives the provider-side net");
        assertEq(token.balanceOf(address(disburser)), 0, "nothing stranded in the disburser");
        assertEq(token.balanceOf(provider), 0, "provider is bypassed as payout receiver");
        assertEq(token.balanceOf(address(escrow)), 0, "escrow drained");
    }

    function test_completeRevertsWhenOptParamsCarryNoContributor() public {
        uint256 jobId = _submittedJob();

        vm.prank(evaluator);
        vm.expectRevert(FundDisburser.InvalidContributorData.selector);
        escrow.complete(jobId, bytes32("approved"), "");
    }

    function test_partialSettlementPaysContributorPerMilestone() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob(provider, evaluator, expiredAt, "job", address(0), 0);

        vm.startPrank(provider);
        escrow.setPayoutReceiver(jobId, address(disburser));
        escrow.setBudget(jobId, address(token), BUDGET, "");
        vm.stopPrank();

        token.mint(client, BUDGET);
        vm.startPrank(client);
        token.approve(address(escrow), BUDGET);
        escrow.fund(jobId, address(token), BUDGET, "");
        vm.stopPrank();

        uint256 milestone = BUDGET / 4;
        bytes memory optParams = abi.encode(contributor);

        vm.prank(provider);
        escrow.submitClaim(jobId, milestone, keccak256("m1"), optParams);
        vm.prank(evaluator);
        escrow.approveClaim(jobId, milestone, keccak256("m1"), optParams);

        assertEq(token.balanceOf(contributor), _netOf(milestone), "paid per milestone delta");
        assertEq(token.balanceOf(address(disburser)), 0);
    }
}
