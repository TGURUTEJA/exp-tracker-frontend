export interface AccountDetails {
  id: string | number;
  userId: string;
  type: string;
  displayName: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string; // ISO string (e.g. "2025-12-05T00:00:00Z")
  additionalData: AccountExtraData | null;
}
export interface AccountExtraData {
  creditCard?: CreditCardPojo | null;
  emi?: EmiAccountPojo | null;
  investment?: InvestmentAccountPojo | null;
  friend?: FriendAccountPojo | null;
}
export interface CreditCardPojo {
  outstanding: number;
  creditLimit?: number | null;
  dueDate?: string | null;
  billDate?: string | null;
}
export interface EmiAccountPojo {
  accountId?: number | string;
  principalAmount: number;
  interestRate: number;
  totalInstallments: number;
  paidInstallments?: number | null;
  emiAmount: number;
  startDate?: string | null;
  endDate?: string | null;
  nextDueDate?: string | null;
}
export interface InvestmentAccountPojo {
  accountId?: number | string;
  investmentType: string;
  purchaseDate?: string | null;
  maturityDate?: string | null;
  amountInvested: number;
  expectedReturn?: number | null;
  currentValue?: number | null;
}
export interface FriendAccountPojo {
  accountId?: number | string;
  friendName?: string | null;
  contactInfo?: string | null;
  outstandingAmount?: number | null;
  loanStartDate?: string | null;
  loanDueDate?: string | null;
}
export interface AccountDetailsResponse {
  data: AccountData | null;
  message: string;
  error: boolean;
}
export type AccountType =
  | "BANK"
  | "CREDIT_CARD"
  | "CASH"
  | "LOAN"
  | "INVESTMENT"
  | "FRIEND";
interface CreateAccountFields {
  displayName: string;
  balance: number;
  currency: string;
}
export interface CreditCardAccountInput {
  outstanding: number;
  creditLimit: number;
  dueDate?: string;
  billDate?: string;
}
export interface EmiAccountInput {
  principalAmount: number;
  interestRate: number;
  totalInstallments: number;
  paidInstallments: number;
  emiAmount: number;
  startDate: string;
  endDate?: string;
  nextDueDate?: string;
}
export interface InvestmentAccountInput {
  investmentType: string;
  purchaseDate: string;
  maturityDate?: string;
  amountInvested: number;
  expectedReturn?: number;
  currentValue: number;
}
export interface FriendAccountInput {
  friendName: string;
  contactInfo?: string;
  outstandingAmount: number;
  loanStartDate?: string;
  loanDueDate?: string;
}
export type CreateAccountPayload =
  | (CreateAccountFields & { type: "BANK" | "CASH" })
  | (CreateAccountFields & {
      type: "CREDIT_CARD";
      additionalData: { creditCard: CreditCardAccountInput };
    })
  | (CreateAccountFields & {
      type: "LOAN";
      additionalData: { emi: EmiAccountInput };
    })
  | (CreateAccountFields & {
      type: "INVESTMENT";
      additionalData: { investment: InvestmentAccountInput };
    })
  | (CreateAccountFields & {
      type: "FRIEND";
      additionalData: { friend: FriendAccountInput };
    });
export interface CreateAccountResponse {
  data: AccountDetails;
  message: string;
  error: boolean;
}
export interface AccountSummary {
  netWorth: number;
  totalBankBalance: number;
  totalCreditCardBalance: number;
  totalInvestments: number;
  totalCash: number;
  totalLoans: number;
  totalFriendCredits: number;
  totalFriendDebits: number;
}
export interface AccountData {
  accountSummary?: AccountSummary | null;
  accountDetailsList?: AccountDetails[] | null;
}

