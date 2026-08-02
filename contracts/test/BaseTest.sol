// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {DataCommerce} from "../src/DataCommerce.sol";
import {Fixtures} from "./fixtures/Fixtures.sol";

abstract contract BaseTest is Fixtures {
    DataCommerce internal dataCommerce;
    uint48 internal expiredAt;

    function setUp() public virtual {
        dataCommerce = _deploy(treasury, address(paymentToken), PLATFORM_FEE_BPS, EVALUATOR_FEE_BPS);
        expiredAt = uint48(block.timestamp + JOB_DURATION);
    }

    // ──────────────────── Deployment ────────────────────

    /// @dev Deploys a fresh, uninitialized implementation. Kept separate from _initProxy so
    ///      tests can arm vm.expectRevert() immediately before the call that should revert.
    function _deployImplementation() internal returns (DataCommerce) {
        return new DataCommerce();
    }

    /// @dev Deploys the proxy for an already-deployed implementation, initializing as `admin`.
    function _initProxy(
        address implementation,
        address treasury_,
        address payoutToken_,
        uint256 platformFeeBps_,
        uint256 evaluatorFeeBps_
    ) internal returns (DataCommerce) {
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)", treasury_, payoutToken_, platformFeeBps_, evaluatorFeeBps_
        );

        vm.prank(admin);
        ERC1967Proxy proxy = new ERC1967Proxy(implementation, initData);
        return DataCommerce(address(proxy));
    }

    /// @dev Deploys implementation + proxy in one call, initialized as `admin`.
    function _deploy(address treasury_, address payoutToken_, uint256 platformFeeBps_, uint256 evaluatorFeeBps_)
        internal
        returns (DataCommerce)
    {
        DataCommerce implementation = _deployImplementation();
        return _initProxy(address(implementation), treasury_, payoutToken_, platformFeeBps_, evaluatorFeeBps_);
    }

    // ──────────────────── Job lifecycle helpers ────────────────────

    /// @dev Opens a job with provider+evaluator already assigned, expiring in JOB_DURATION.
    function _createJob() internal returns (uint256 jobId) {
        vm.prank(client);
        jobId = dataCommerce.createJob(provider, evaluator, expiredAt, "job description", address(0), 0);
    }

    /// @dev Opens a job with no provider assigned yet, for setProvider() coverage.
    function _createJobWithoutProvider() internal returns (uint256 jobId) {
        vm.prank(client);
        jobId = dataCommerce.createJob(address(0), evaluator, expiredAt, "job description", address(0), 0);
    }

    /// @dev Provider sets the default token + JOB_BUDGET on an Open job.
    function _setBudget(uint256 jobId) internal {
        vm.prank(provider);
        dataCommerce.setBudget(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    /// @dev Mints+approves+funds JOB_BUDGET of the default token as client.
    function _fund(uint256 jobId) internal {
        paymentToken.mint(client, JOB_BUDGET);
        vm.prank(client);
        paymentToken.approve(address(dataCommerce), JOB_BUDGET);
        vm.prank(client);
        dataCommerce.fund(jobId, address(paymentToken), JOB_BUDGET, "");
    }

    /// @dev Composes create + setBudget + fund. The common starting point for
    ///      submit/complete/reject/claimRefund tests.
    function _createFundedJob() internal returns (uint256 jobId) {
        jobId = _createJob();
        _setBudget(jobId);
        _fund(jobId);
    }

    /// @dev Provider submits a deliverable for a Funded job.
    function _submit(uint256 jobId) internal {
        vm.prank(provider);
        dataCommerce.submit(jobId, keccak256("deliverable"), "");
    }

    /// @dev Composes _createFundedJob + submit, for complete/reject tests in the Submitted state.
    function _createSubmittedJob() internal returns (uint256 jobId) {
        jobId = _createFundedJob();
        _submit(jobId);
    }

    /// @dev Admin allowlists an additional payment token (paymentToken is already allowed at init).
    function _allowPaymentToken(address token) internal {
        vm.prank(admin);
        dataCommerce.setPaymentTokenAllowed(token, true);
    }
}
