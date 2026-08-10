import axios from "axios";
import { apiKeyBlockscout } from "@/config/env";
import { networkConfig } from "@/config/network";

export const httpBlockscout = axios.create({
  baseURL: "https://api.blockscout.com/v2/api",
  params: {
    chain_id: networkConfig.chain.id,
    apikey: apiKeyBlockscout,
  },
});
