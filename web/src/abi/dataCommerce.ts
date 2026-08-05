// Generated from out/DataCommerce.sol/DataCommerce.json — do not edit by hand.
export const dataCommerceAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "EVALUATOR_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PROVIDER_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approveJobClaim",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deliverable",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "commerce",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AgenticCommerce",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "completeJob",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createDataJob",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct DataCommerce.CreateDataJobParams",
        components: [
          {
            name: "expiredAt",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "hook",
            type: "address",
            internalType: "address",
          },
          {
            name: "providerAgentId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "clientAuth",
        type: "tuple",
        internalType: "struct AgenticCommerce.Authorization",
        components: [
          {
            name: "signer",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint72",
            internalType: "uint72",
          },
          {
            name: "deadline",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "sig",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "evaluatorAgent",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract EvaluatorAgent",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getJob",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ERC8183.Job",
        components: [
          {
            name: "client",
            type: "address",
            internalType: "address",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum ERC8183.JobStatus",
          },
          {
            name: "provider",
            type: "address",
            internalType: "address",
          },
          {
            name: "expiredAt",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "evaluator",
            type: "address",
            internalType: "address",
          },
          {
            name: "submittedAt",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "budget",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "hook",
            type: "address",
            internalType: "address",
          },
          {
            name: "paymentToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "providerAgentId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          {
            name: "settledAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "payoutReceiver",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "commerce_",
        type: "address",
        internalType: "address",
      },
      {
        name: "treasury_",
        type: "address",
        internalType: "address",
      },
      {
        name: "payoutToken_",
        type: "address",
        internalType: "address",
      },
      {
        name: "admin_",
        type: "address",
        internalType: "address",
      },
      {
        name: "provider_",
        type: "address",
        internalType: "address",
      },
      {
        name: "evaluator_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "migrateAgents",
    inputs: [
      {
        name: "entrypoint_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "payoutToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "providerAgent",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ProviderAgent",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rejectJob",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rejectJobClaim",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deliverable",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "reason",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rejectOpenJob",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "callerConfirmation",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAgents",
    inputs: [
      {
        name: "providerAgent_",
        type: "address",
        internalType: "address",
      },
      {
        name: "evaluatorAgent_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCommerce",
    inputs: [
      {
        name: "commerce_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setJobBudget",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "budget",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPayoutToken",
    inputs: [
      {
        name: "payoutToken_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTreasury",
    inputs: [
      {
        name: "treasury_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitJob",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deliverable",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitJobClaim",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deliverable",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sweepAgentBalances",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "treasury",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "withdrawJobClaim",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deliverable",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "reason",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AgentsUpdated",
    inputs: [
      {
        name: "providerAgent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "evaluatorAgent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CommerceUpdated",
    inputs: [
      {
        name: "commerce",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DataJobCreated",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "client",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "budget",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayoutTokenUpdated",
    inputs: [
      {
        name: "payoutToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TreasuryUpdated",
    inputs: [
      {
        name: "treasury",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: [],
  },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "AgentsMustDiffer",
    inputs: [],
  },
  {
    type: "error",
    name: "AgentsNotSet",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: [],
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: [],
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
] as const;
