import { API_STATS_URL } from "@/config";
import axios from "@/utils/axios";

export const getMerchantStats = async () => {
  const response = await axios(API_STATS_URL).get("/merchants");
  return response;
};
