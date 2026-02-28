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
  creditCard: CreditCardPojo | null;
  emi: EmiAccountPojo | null;
  investment: InvestmentAccountPojo | null;
  friend: FriendAccountPojo | null;
}
export interface CreditCardPojo {
  outstanding: number;
  creditLimit: number;
  dueDate: string; // "YYYY-MM-DD"
  billDate: string;
}
export interface EmiAccountPojo extends AccountDetails {
  accountId: number | string;
  principalAmount: number;
  interestRate: number;
  totalInstallments: number;
  paidInstallments: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  nextDueDate: string;
}
export interface InvestmentAccountPojo extends AccountDetails {
  accountId: number | string;
  investmentType: string;
  purchaseDate: string;
  maturityDate: string;
  amountInvested: number;
  expectedReturn: number;
  currentValue: number;
}
export interface FriendAccountPojo extends AccountDetails {
  accountId: number | string;
  friendName: string;
  contactInfo: string;
  outstandingAmount: number;
  loanStartDate: string;
  loanDueDate: string;
}
export interface AccountDetailsResponse {
  data: AccountData;
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
    accountSummary:AccountSummary;
    accountDetailsList:AccountDetails[];
}

