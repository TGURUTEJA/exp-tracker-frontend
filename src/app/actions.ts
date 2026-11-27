import type {
  AccountDetailsResponse,
  CreateAccountPayload,
  CreateAccountResponse,
} from "@/types/AccountTyes";
import type { UserDetailsResponse } from "@/types/store";
import type {
  BudgetPayload,
  BudgetRecord,
  BudgetResponse,
} from "@/types/BudgetTypes";
import type {
  AccountTransaction,
  TransactionFilters,
  TransactionPayload,
  TransactionRecord,
  TransactionResponse,
} from "@/types/TransactionTypes";
import { customApiCall } from "./service";

export async function getUserData() {
  return customApiCall<UserDetailsResponse>("/api/App/user/Details", "GET", {
    withCredentials: true,
  });
}

export async function getAccountdata() {
  return customApiCall<AccountDetailsResponse>(
    "/api/App/account/Details_by_userId",
    "GET",
    {
      withCredentials: true,
    }
  );
}

export async function getTransactionHistory() {
  const response = await customApiCall<unknown>(
    "/api/App/transaction/history",
    "GET",
    { withCredentials: true }
  );

  if (!Array.isArray(response) || !response.every(isAccountTransaction)) {
    throw new Error("Invalid transaction history response");
  }

  return response;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const search = new URLSearchParams();
  if (filters.startDate) search.set("startDate", filters.startDate);
  if (filters.endDate) search.set("endDate", filters.endDate);
  if (filters.accountId !== undefined) search.set("accountId", String(filters.accountId));
  if (filters.categoryId !== undefined) search.set("categoryId", String(filters.categoryId));
  const query = search.size > 0 ? `?${search.toString()}` : "";
  const response = await customApiCall<unknown>(`/api/App/transaction${query}`, "GET", {
    withCredentials: true,
  });
  if (!Array.isArray(response)) {
    throw new Error("Invalid transactions response");
  }
  return response as TransactionRecord[];
}

export async function createTransaction(body: TransactionPayload) {
  return customApiCall<TransactionResponse<TransactionRecord>>(
    "/api/App/transaction",
    "POST",
    { body, withCredentials: true }
  );
}

export async function updateTransaction(id: number, body: TransactionPayload) {
  return customApiCall<TransactionResponse<TransactionRecord>>(
    `/api/App/transaction/${id}`,
    "PUT",
    { body, withCredentials: true }
  );
}

export async function deleteTransaction(id: number) {
  return customApiCall<TransactionResponse<boolean>>(
    `/api/App/transaction/${id}`,
    "DELETE",
    { withCredentials: true }
  );
}

export async function getBudgets(year?: number, month?: number) {
  const search = new URLSearchParams();
  if (year !== undefined && month !== undefined) {
    search.set("year", String(year));
    search.set("month", String(month));
  }
  const query = search.size > 0 ? `?${search.toString()}` : "";
  const response = await customApiCall<unknown>(`/api/App/budget${query}`, "GET", {
    withCredentials: true,
  });
  if (!Array.isArray(response)) {
    throw new Error("Invalid budgets response");
  }
  return response as BudgetRecord[];
}

export async function createBudget(body: BudgetPayload) {
  return customApiCall<BudgetResponse<BudgetRecord>>(
    "/api/App/budget",
    "POST",
    { body, withCredentials: true }
  );
}

export async function updateBudget(id: string, body: BudgetPayload) {
  return customApiCall<BudgetResponse<BudgetRecord>>(
    `/api/App/budget/${id}`,
    "PUT",
    { body, withCredentials: true }
  );
}

export async function deleteBudget(id: string) {
  return customApiCall<BudgetResponse<boolean>>(
    `/api/App/budget/${id}`,
    "DELETE",
    { withCredentials: true }
  );
}

export async function createAccount(body: CreateAccountPayload) {
  return customApiCall<CreateAccountResponse>("/api/App/account/create_account", "POST", {
    body,
    withCredentials: true,
  });
}

export interface CreateCategoryPayload {
  name: string;
  type: string;
  icon: string;
  color: string;
}

export async function createCategory(body: CreateCategoryPayload) {
  return customApiCall("/api/App/category/create_category", "POST", {
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
  return customApiCall("/api/App/category/update_category", "PUT", {
    body,
    withCredentials: true,
  });
}

export async function deleteCategory(id: number) {
  return customApiCall(`/api/App/category/delete_category/${id}`, "DELETE", {
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

function isAccountTransaction(value: unknown): value is AccountTransaction {
  if (typeof value !== "object" || value === null) return false;
  const transaction = value as Record<string, unknown>;
  return (
    isNullableNumber(transaction.id) &&
    isNullableNumber(transaction.accountId) &&
    isNullableNumber(transaction.amount) &&
    (transaction.debitCredit === null ||
      typeof transaction.debitCredit === "string") &&
    (transaction.created === null || typeof transaction.created === "string") &&
    isNullableNumber(transaction.accountBalance)
  );
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}



