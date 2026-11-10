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

export interface CreateCategoryPayload {
  name: string;
  type: string;
  icon: string;
  color: string;
}

export async function createCategory(body: CreateCategoryPayload) {
  return customApiCall<any>("/api/App/category/create_category", "POST", {
    body,
    withCredentials: true,
  });
}

export interface UpdateCategoryPayload {
  id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
}

export async function updateCategory(body: UpdateCategoryPayload) {
  return customApiCall<any>("/api/App/category/update_category", "PUT", {
    body,
    withCredentials: true,
  });
}

export async function deleteCategory(id: number) {
  return customApiCall<any>(`/api/App/category/delete_category/${id}`, "DELETE", {
    withCredentials: true,
  });
}

export interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}

export interface GetCategoriesResponse {
  message: string;
  error: boolean;
  data: Category[];
}

export async function getCategories() {
  return customApiCall<GetCategoriesResponse>("/api/App/category/get_category", "GET", {
    withCredentials: true,
  });
}



