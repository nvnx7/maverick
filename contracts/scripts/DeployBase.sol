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
import {DeviceRegistry} from "../src/DeviceRegistry.sol";

abstract contract DeployBase is Script {
    using stdJson for string;

    /// @dev One entry of scripts/config.json.
    struct ChainConfig {
        address usdc;
        uint256 platformFeeBps;
        uint256 evaluatorFeeBps;
    }

    struct Deployment {
        address usdc;
        address escrow;
        address dataCommerce;
        address providerAgent;
        address evaluatorAgent;
        address fundDisburser;
        address deviceRegistry;
    }

    /// @dev Deploys the full stack against `config.usdc` and leaves `deployer` holding
    ///      every role. Must run inside an active broadcast.
    function _deployStack(ChainConfig memory config, address deployer)
        internal
        returns (Deployment memory deployment)
    {
        address usdc = config.usdc;

        // Escrow (ERC-8183) behind a UUPS proxy
        AgenticCommerce escrowImpl = new AgenticCommerce();
        bytes memory escrowInit = abi.encodeWithSignature("initialize(address,address)", deployer, deployer);
        AgenticCommerce escrow = AgenticCommerce(address(new ERC1967Proxy(address(escrowImpl), escrowInit)));

        // FundDisburser
        FundDisburser fundDisburser = new FundDisburser(address(escrow));

        // DataCommerce entrypoint behind a UUPS proxy
        DataCommerce commerceImpl = new DataCommerce();
        bytes memory commerceInit = abi.encodeCall(
            DataCommerce.initialize,
            (address(escrow), address(fundDisburser), deployer, usdc, deployer, deployer, deployer)
        );
        DataCommerce dataCommerce = DataCommerce(address(new ERC1967Proxy(address(commerceImpl), commerceInit)));

        // Provider and Evaluator
        ProviderAgent providerAgent = new ProviderAgent(address(escrow), address(dataCommerce));
        EvaluatorAgent evaluatorAgent = new EvaluatorAgent(address(escrow), address(dataCommerce));

        // DeviceRegistry
        DeviceRegistry deviceRegistry = new DeviceRegistry();

        // Setup 
        dataCommerce.setAgents(address(providerAgent), address(evaluatorAgent));
        escrow.setPaymentTokenAllowed(usdc, true);
        escrow.setPlatformFee(config.platformFeeBps, deployer);
        escrow.setEvaluatorFee(config.evaluatorFeeBps);

        deployment = Deployment({
            usdc: usdc,
            escrow: address(escrow),
            dataCommerce: address(dataCommerce),
            providerAgent: address(providerAgent),
            evaluatorAgent: address(evaluatorAgent),
            fundDisburser: address(fundDisburser),
            deviceRegistry: address(deviceRegistry)
        });
    }

    /// @dev Reads one entry of scripts/config.json by chain key ("local", "arcTestnet", …).
    function _loadConfig(string memory chainKey) internal view returns (ChainConfig memory) {
        string memory json = vm.readFile("scripts/config.json");
        string memory base = string.concat(".", chainKey);
        return ChainConfig({
            usdc: json.readAddress(string.concat(base, ".usdc")),
            platformFeeBps: json.readUint(string.concat(base, ".platformFeeBps")),
            evaluatorFeeBps: json.readUint(string.concat(base, ".evaluatorFeeBps"))
        });
    }

    function _saveDeployment(string memory chainKey, Deployment memory deployment) internal {
        string memory objKey = "deployment";
        vm.serializeString(objKey, "network", chainKey);
        // The app scans logs from here rather than block 0 — Arc's RPC refuses wide
        // eth_getLogs spans, and nothing relevant exists before the contracts did.
        vm.serializeUint(objKey, "deployedBlock", block.number);
        vm.serializeAddress(objKey, "usdc", deployment.usdc);
        vm.serializeAddress(objKey, "escrow", deployment.escrow);
        vm.serializeAddress(objKey, "dataCommerce", deployment.dataCommerce);
        vm.serializeAddress(objKey, "providerAgent", deployment.providerAgent);
        vm.serializeAddress(objKey, "evaluatorAgent", deployment.evaluatorAgent);
        vm.serializeAddress(objKey, "fundDisburser", deployment.fundDisburser);
        string memory finalJson = vm.serializeAddress(objKey, "deviceRegistry", deployment.deviceRegistry);

        string memory outFile = string.concat("deployments/", chainKey, ".json");
        vm.writeJson(finalJson, outFile);

        console2.log("Deployed to", chainKey);
        console2.log("  deployedBlock: ", block.number);
        console2.log("  usdc:          ", deployment.usdc);
        console2.log("  escrow:        ", deployment.escrow);
        console2.log("  dataCommerce:  ", deployment.dataCommerce);
        console2.log("  providerAgent: ", deployment.providerAgent);
        console2.log("  evaluatorAgent:", deployment.evaluatorAgent);
        console2.log("  fundDisburser: ", deployment.fundDisburser);
        console2.log("  deviceRegistry:", deployment.deviceRegistry);
        console2.log("Wrote", outFile);
    }
}
