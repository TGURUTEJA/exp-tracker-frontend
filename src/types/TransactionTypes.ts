export interface AccountTransaction {
  id: number | null;
  accountId: number | null;
  amount: number | null;
  debitCredit: string | null;
  created: string | null;
  accountBalance: number | null;
}

export interface TransactionRecord {
  id: number;
  userId: string;
  accountId: number;
  categoryId: number | null;
  description: string | null;
  amount: number;
  debitCredit: "credit" | "debit" | string;
  created: string;
  accountBalance: number | null;
}

export interface TransactionPayload {
  accountId: number;
  categoryId: number | null;
  description: string;
  amount: number;
  debitCredit: "credit" | "debit";
  created: string;
}

export interface TransactionResponse<T> {
  message: string;
  error: boolean;
  data: T;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  categoryId?: number;
}
