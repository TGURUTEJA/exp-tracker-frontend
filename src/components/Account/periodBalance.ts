import type { AccountDetails, AccountType } from "@/types/AccountTyes";
import type { AccountTransaction } from "@/types/TransactionTypes";
import type {
  DailyDateRange,
  PeriodPreset,
} from "@/context/DashboardFiltersContext";

export interface PeriodWindow {
  start: Date;
  end: Date;
  label: string;
}

export interface BalanceComparison {
  start: number;
  current: number;
  change: number;
  percentage: number | null;
}

export interface NetWorthBreakdown {
  assets: number;
  liabilities: number;
}

export function getPeriodWindow(
  period: PeriodPreset,
  dailyRange: DailyDateRange,
  now = new Date()
): PeriodWindow {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  if (period === "daily") {
    let start = parseLocalDate(dailyRange.start) ?? todayStart;
    let end = parseLocalDate(dailyRange.end) ?? todayEnd;
    if (start > end) [start, end] = [end, start];
    end.setHours(23, 59, 59, 999);
    return { start, end, label: "Selected range" };
  }

  if (period === "yearly") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: todayEnd,
      label: "This year",
    };
  }

  if (period === "weekly") {
    const start = new Date(todayStart);
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    return { start, end: todayEnd, label: "This week" };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: todayEnd,
    label: "This month",
  };
}

export function getAccountPeriodComparison(
  account: AccountDetails,
  transactions: AccountTransaction[],
  period: PeriodWindow
): BalanceComparison | null {
  const history = transactions
    .filter((transaction) => String(transaction.accountId) === String(account.id))
    .map((transaction) => ({
      transaction,
      created: parseDateTime(transaction.created),
    }))
    .filter(
      (item): item is { transaction: AccountTransaction; created: Date } =>
        item.created !== null
    )
    .sort((left, right) => left.created.getTime() - right.created.getTime());

  const priorTransactions = history.filter(
    (item) => item.created < period.start
  );
  const lastBeforePeriod = priorTransactions[priorTransactions.length - 1];
  const accountCreated = parseDateTime(account.createdAt);
  let start: number | null;

  if (lastBeforePeriod) {
    start = finiteOrNull(lastBeforePeriod.transaction.accountBalance);
  } else if (accountCreated && accountCreated >= period.start) {
    start = 0;
  } else if (history.length === 0) {
    start = finiteAmount(account.balance);
  } else {
    start = null;
  }

  let current: number | null;
  if (period.end >= endOfToday()) {
    current = getCurrentAccountBalance(account);
  } else {
    const transactionsByPeriodEnd = history.filter(
      (item) => item.created <= period.end
    );
    const lastByPeriodEnd =
      transactionsByPeriodEnd[transactionsByPeriodEnd.length - 1];

    if (lastByPeriodEnd) {
      current = finiteOrNull(lastByPeriodEnd.transaction.accountBalance);
    } else if (accountCreated && accountCreated > period.end) {
      current = 0;
    } else if (history.length === 0) {
      current = finiteAmount(account.balance);
    } else {
      current = null;
    }
  }

  if (start === null || current === null) return null;

  const change = current - start;
  return {
    start,
    current,
    change,
    percentage: start === 0 ? null : (change / Math.abs(start)) * 100,
  };
}

export function getCurrentAccountBalance(account: AccountDetails): number {
  const type = account.type as AccountType;
  if (type === "CREDIT_CARD") {
    return finiteAmount(
      account.additionalData?.creditCard?.outstanding ?? account.balance
    );
  }
  if (type === "INVESTMENT") {
    return finiteAmount(
      account.additionalData?.investment?.currentValue ?? account.balance
    );
  }
  return finiteAmount(account.balance);
}

export function getNetWorthBreakdown(
  accounts: AccountDetails[]
): NetWorthBreakdown {
  return accounts.reduce(
    (totals, account) => {
      const balance = getCurrentAccountBalance(account);
      switch (account.type) {
        case "BANK":
        case "CASH":
        case "INVESTMENT":
          totals.assets += Math.max(balance, 0);
          break;
        case "CREDIT_CARD":
        case "LOAN":
          totals.liabilities += Math.max(balance, 0);
          break;
        case "FRIEND":
          totals.assets += Math.max(balance, 0);
          totals.liabilities += Math.max(-balance, 0);
          break;
      }
      return totals;
    },
    { assets: 0, liabilities: 0 }
  );
}

export function getNetWorthComparison(
  accounts: AccountDetails[],
  transactions: AccountTransaction[],
  period: PeriodWindow
): BalanceComparison | null {
  let start = 0;
  let current = 0;

  for (const account of accounts) {
    const sign = getNetWorthSign(account.type);
    if (sign === null) continue;

    const comparison = getAccountPeriodComparison(account, transactions, period);
    if (!comparison) return null;

    start += comparison.start * sign;
    current += comparison.current * sign;
  }

  return createComparison(start, current);
}

export function getAccountTypeComparison(
  type: AccountType,
  accounts: AccountDetails[],
  transactions: AccountTransaction[],
  period: PeriodWindow
): BalanceComparison | null {
  let start = 0;
  let current = 0;

  for (const account of accounts.filter((item) => item.type === type)) {
    const comparison = getAccountPeriodComparison(account, transactions, period);
    if (!comparison) return null;

    start += comparison.start;
    current += comparison.current;
  }

  return createComparison(start, current);
}

function getNetWorthSign(type: string): number | null {
  switch (type) {
    case "CREDIT_CARD":
    case "LOAN":
      return -1;
    case "BANK":
    case "CASH":
    case "INVESTMENT":
    case "FRIEND":
      return 1;
    default:
      return null;
  }
}

function createComparison(start: number, current: number): BalanceComparison {
  const change = current - start;
  return {
    start,
    current,
    change,
    percentage: start === 0 ? null : (change / Math.abs(start)) * 100,
  };
}

function finiteAmount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return parseDateTime(value);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function parseDateTime(value: string | null): Date | null {
  if (!value) return null;
  const date = parseLocalDateOnly(value);
  if (date) return date;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseLocalDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function endOfToday(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
}
