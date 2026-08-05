// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {console2} from "forge-std/console2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AgenticCommerce} from "../src/AgenticCommerce.sol";
import {DataCommerce} from "../src/DataCommerce.sol";
import {ProviderAgent} from "../src/agents/ProviderAgent.sol";
import {EvaluatorAgent} from "../src/agents/EvaluatorAgent.sol";
import {FundDisburser} from "../src/FundDisburser.sol";

/// @notice Deploys the full stack and wires it together.
/// @dev Run with `--sig "run(string)" "<chainKey>"`, picking the chainKey out of
///      config.json — chainid isn't reliable for this, since a local fork of
///      arcTestnet reports arcTestnet's own chainid.
contract Deploy is Script {
    using stdJson for string;

    struct ChainConfig {
        address usdc;
        uint256 platformFeeBps;
        uint256 evaluatorFeeBps;
    }

    function run(string memory chainKey) external {
        ChainConfig memory config = _loadConfig(chainKey);

        vm.startBroadcast();
        address deployer = msg.sender;

        // ── Escrow (ERC-8183) behind a UUPS proxy ──
        AgenticCommerce escrowImpl = new AgenticCommerce();
        bytes memory escrowInit = abi.encodeWithSignature("initialize(address,address)", deployer, deployer);
        ERC1967Proxy escrowProxy = new ERC1967Proxy(address(escrowImpl), escrowInit);
        AgenticCommerce escrow = AgenticCommerce(address(escrowProxy));

        // ── DataCommerce entrypoint behind a UUPS proxy ──
        DataCommerce commerceImpl = new DataCommerce();
        bytes memory commerceInit = abi.encodeCall(
            DataCommerce.initialize,
            (address(escrow), deployer, config.usdc, deployer, deployer, deployer)
        );
        ERC1967Proxy commerceProxy = new ERC1967Proxy(address(commerceImpl), commerceInit);
        DataCommerce dataCommerce = DataCommerce(address(commerceProxy));

        // Agents take the entrypoint address in their constructor, so they can
        // only be built once the proxy exists — hence the post-deploy setAgents.
        ProviderAgent providerAgent = new ProviderAgent(address(escrow), address(dataCommerce));
        EvaluatorAgent evaluatorAgent = new EvaluatorAgent(address(escrow), address(dataCommerce));
        dataCommerce.setAgents(address(providerAgent), address(evaluatorAgent));

        FundDisburser fundDisburser = new FundDisburser(address(escrow));

        // Without an allowlisted payment token no job can be funded, so the
        // escrow is not usable until these land.
        escrow.setPaymentTokenAllowed(config.usdc, true);
        escrow.setPlatformFee(config.platformFeeBps, deployer);
        escrow.setEvaluatorFee(config.evaluatorFeeBps);

        vm.stopBroadcast();

        _saveDeployment(
            chainKey,
            address(escrow),
            address(dataCommerce),
            address(providerAgent),
            address(evaluatorAgent),
            address(fundDisburser)
        );
    }

    function _loadConfig(string memory chainKey) internal view returns (ChainConfig memory) {
        string memory json = vm.readFile("scripts/config.json");
        string memory base = string.concat(".", chainKey);
        return ChainConfig({
            usdc: json.readAddress(string.concat(base, ".usdc")),
            platformFeeBps: json.readUint(string.concat(base, ".platformFeeBps")),
            evaluatorFeeBps: json.readUint(string.concat(base, ".evaluatorFeeBps"))
        });
    }

    function _saveDeployment(
        string memory chainKey,
        address escrow,
        address dataCommerce,
        address providerAgent,
        address evaluatorAgent,
        address fundDisburser
    ) internal {
        string memory objKey = "deployment";
        vm.serializeString(objKey, "network", chainKey);
        vm.serializeAddress(objKey, "escrow", escrow);
        vm.serializeAddress(objKey, "dataCommerce", dataCommerce);
        vm.serializeAddress(objKey, "providerAgent", providerAgent);
        vm.serializeAddress(objKey, "evaluatorAgent", evaluatorAgent);
        string memory finalJson = vm.serializeAddress(objKey, "fundDisburser", fundDisburser);

        string memory outFile = string.concat("deployments/", chainKey, ".json");
        vm.writeJson(finalJson, outFile);

        console2.log("Deployed to", chainKey);
        console2.log("  escrow:        ", escrow);
        console2.log("  dataCommerce:  ", dataCommerce);
        console2.log("  providerAgent: ", providerAgent);
        console2.log("  evaluatorAgent:", evaluatorAgent);
        console2.log("  fundDisburser: ", fundDisburser);
        console2.log("Wrote", outFile);
    }
}
