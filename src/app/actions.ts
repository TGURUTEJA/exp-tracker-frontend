import { customApiCall } from "./service";

export async function getUserData() {
  return customApiCall('/api/App/user/Details', 'GET', {
    withCredentials: true,
  });
}

export async function getAccountdata() {
  console.log("test account data")
  return customApiCall('/api/App/account/Details_by_userId', 'GET', {
    withCredentials: true,
  });
}
