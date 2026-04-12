import type { AccountDetailsResponse } from "@/types/AccountTyes";
import type { UserDetailsResponse } from "@/types/store";
import { customApiCall } from "./service";

export async function getUserData() {
  return customApiCall<UserDetailsResponse>("/api/App/user/Details", "GET", {
    withCredentials: true,
  });
}

export async function getAccountdata() {
  console.log("test account data");
  return customApiCall<AccountDetailsResponse>(
    "/api/App/account/Details_by_userId",
    "GET",
    {
      withCredentials: true,
    }
  );
}
