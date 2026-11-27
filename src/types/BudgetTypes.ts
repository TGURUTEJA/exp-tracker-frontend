export interface BudgetRecord {
  id: string;
  userId: string;
  categoryId: number;
  year: number;
  month: number;
  amount: number;
  isActive: boolean;
  recurrence: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BudgetPayload {
  categoryId: number;
  year: number;
  month: number;
  amount: number;
  isActive?: boolean;
  recurrence?: string;
}

export interface BudgetResponse<T> {
  message: string;
  error: boolean;
  data: T;
}
