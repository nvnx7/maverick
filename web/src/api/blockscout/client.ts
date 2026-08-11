import axios from "axios";
import { networkConfig } from "@/config/network";

// Same-origin path, proxied to api.blockscout.com via the rewrite in next.config.ts —
// keeps the request off Blockscout's CORS policy and the API key out of the client bundle.
export const httpBlockscout = axios.create({
  baseURL: "/api/blockscout",
  params: {
    chain_id: networkConfig.chain.id,
  },
});
