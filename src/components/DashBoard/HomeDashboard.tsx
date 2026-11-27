"use client";

import { getAccountdata, getBudgets, getCategories, getTransactions } from "@/app/actions";
import type { AccountDetails } from "@/types/AccountTyes";
import type { BudgetRecord } from "@/types/BudgetTypes";
import type { Category } from "@/app/actions";
import type { TransactionRecord } from "@/types/TransactionTypes";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import { useQuery } from "@tanstack/react-query";
import { getPeriodWindow } from "@/components/Account/periodBalance";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpRightFromSquare,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

const cardButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/5";

const cardPrimaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-2.5 py-1 text-xs font-bold text-slate-950 transition hover:bg-yellow-300";

export default function HomeDashboard() {
  const transactionsQuery = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => getTransactions(),
  });
  const accountsQuery = useQuery({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const transactions = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : [];
  const accounts = accountsQuery.data?.data?.accountDetailsList ?? [];

  return (
    <section className="grid gap-3 lg:grid-cols-2 xl:h-full xl:min-h-0 xl:grid-cols-[repeat(16,minmax(0,1fr))] xl:grid-rows-2" aria-label="Home dashboard overview">
      {[
        {
          title: "Spending insights",
          description: "Spending trends and highlights will appear here.",
          Icon: Sparkles,
          positionClass: "xl:col-start-13 xl:row-start-1",
        },
        {
          title: "Savings goals",
          description: "Track progress toward your savings goals here.",
          Icon: Target,
          positionClass: "xl:col-start-13 xl:row-start-2",
        },
      ].map(({ title, description, Icon, positionClass }) => (
        <article
          key={title}
          className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-dashed border-slate-700 bg-[#0b1220] ${positionClass} xl:col-span-4`}
        >
          <div className="shrink-0 border-b border-white/5 px-3 py-3">
            <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-300">
              <Icon size={18} />
            </span>
            <p className="text-xs leading-relaxed text-slate-400">{description}</p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Coming soon
            </span>
          </div>
        </article>
      ))}

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] xl:col-start-5 xl:col-span-8 xl:row-start-1 xl:row-span-2">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
          <h2 className="font-semibold text-white">Recent transactions</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/transactions"
              aria-label="View all transactions"
              title="View all transactions"
              className={cardButtonClass}
            >
              <ArrowUpRightFromSquare size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/transactions"
              aria-label="Add transaction"
              title="Add transaction"
              className={cardPrimaryButtonClass}
            >
              <Plus size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
          {transactionsQuery.isPending ? (
            <div role="status" className="p-4 text-sm text-slate-400">Loading activity…</div>
          ) : transactionsQuery.isError ? (
            <div role="alert" className="flex items-center justify-between gap-3 p-4 text-sm text-red-200">
              <span>{transactionsQuery.error.message || "Could not load recent activity."}</span>
              <button type="button" onClick={() => void transactionsQuery.refetch()} className="font-semibold underline">Retry</button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-4">
              <p className="text-sm font-medium text-white">No transactions yet</p>
              <p className="mt-1 text-sm text-slate-400">Add an income or expense to see your activity here.</p>
              <Link href="/transactions" className="mt-3 inline-block text-sm font-semibold text-yellow-300 hover:underline">
                Create your first transaction
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {transactions.slice(0, 5).map((transaction) => (
                <RecentTransaction
                  key={transaction.id}
                  transaction={transaction}
                  account={accounts.find((account) => Number(account.id) === transaction.accountId)}
                />
              ))}
            </ul>
          )}
        </div>
      <BudgetProgressCard />

    </section>
  );
}

export function CategoryActivityCard() {
  const { period, dailyRange } = useDashboardFilters();
  const transactionsQuery = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => getTransactions(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const accountsQuery = useQuery({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const transactions = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : [];
  const accounts = accountsQuery.data?.data?.accountDetailsList ?? [];
  const categories =
    categoriesQuery.data && !categoriesQuery.data.error
      ? categoriesQuery.data.data ?? []
      : [];
  const periodWindow = getPeriodWindow(period, dailyRange);
  const periodTransactions = transactions.filter((transaction) => {
    const created = new Date(transaction.created);
    return (
      !Number.isNaN(created.getTime()) &&
      created >= periodWindow.start &&
      created <= periodWindow.end
    );
  });
  const periodSpending = periodTransactions
    .filter((transaction) => isExpense(transaction, categories, accounts))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const categoryActivity = getCategoryActivity(periodTransactions, categories, accounts);
  const topCategories = categoryActivity.slice(0, 4);

  return (
    <section
      aria-label="Category activity"
      className="flex h-full min-h-[212px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
        <div>
          <h2 className="font-semibold text-white">Category activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatCurrency(periodSpending)} spent · {periodWindow.label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/categories"
            aria-label="View all categories"
            title="View all categories"
            className={cardButtonClass}
          >
            <ArrowUpRightFromSquare size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/categories"
            aria-label="Add category"
            title="Add category"
            className={cardPrimaryButtonClass}
          >
            <Plus size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {categoriesQuery.isPending || transactionsQuery.isPending || accountsQuery.isPending ? (
        <div role="status" className="p-4 text-sm text-slate-400">Loading categories…</div>
      ) : categoriesQuery.isError || categoriesQuery.data?.error || accountsQuery.isError ? (
        <div role="alert" className="flex items-center justify-between gap-3 p-4 text-sm text-red-200">
          <span>
            {categoriesQuery.error?.message ||
              accountsQuery.error?.message ||
              categoriesQuery.data?.message ||
              "Could not load category activity."}
          </span>
          <button
            type="button"
            onClick={() => {
              void categoriesQuery.refetch();
              void accountsQuery.refetch();
            }}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : categoryActivity.length === 0 ? (
        <div className="p-4">
          <p className="text-sm text-slate-400">
            {periodTransactions.length === 0
              ? "Category totals will appear after you add transactions in this period."
              : `No categorized expenses for ${periodWindow.label.toLowerCase()}.`}
          </p>
          <Link href="/categories" className="mt-3 inline-block text-sm font-semibold text-yellow-300 hover:underline">
            Manage categories
          </Link>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-y-2 overflow-y-auto p-3">
          {topCategories.map((item) => {
            const width =
              periodSpending > 0
                ? Math.min((item.amount / periodSpending) * 100, 100)
                : 0;
            return (
              <div key={item.id} className="min-w-0">
                <div className="mb-1 flex min-w-0 items-center justify-between gap-2 text-xs">
                  <span className="truncate text-slate-300">{item.name}</span>
                  <span className="shrink-0 font-medium text-white">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function BudgetProgressCard() {
  const transactionsQuery = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => getTransactions(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const accountsQuery = useQuery({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const budgetsQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets(),
  });

  const transactions = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : [];
  const budgets = Array.isArray(budgetsQuery.data) ? budgetsQuery.data : [];
  const accounts = accountsQuery.data?.data?.accountDetailsList ?? [];
  const categories =
    categoriesQuery.data && !categoriesQuery.data.error
      ? categoriesQuery.data.data ?? []
      : [];
  const monthTransactions = transactions.filter(isCurrentMonth);
  const categoryActivity = getCategoryActivity(monthTransactions, categories, accounts);
  const budgetProgress = getBudgetProgress(budgets, categories, categoryActivity);
  const isPending =
    transactionsQuery.isPending ||
    categoriesQuery.isPending ||
    accountsQuery.isPending ||
    budgetsQuery.isPending;
  const hasError =
    transactionsQuery.isError ||
    categoriesQuery.isError ||
    categoriesQuery.data?.error === true ||
    accountsQuery.isError ||
    budgetsQuery.isError;

  return (
    <section
      aria-label="Budget progress"
      className="flex h-full min-h-[212px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] xl:col-start-1 xl:col-span-4 xl:row-start-1 xl:row-span-2"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/5 px-3 py-3">
        <div>
          <h2 className="font-semibold text-white">Budget progress</h2>
          <p className="mt-0.5 text-xs text-slate-500">Top 3 this month</p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/budgets"
            aria-label="View all budgets"
            title="View all budgets"
            className={cardButtonClass}
          >
            <ArrowUpRightFromSquare size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/budgets"
            aria-label="Add budget"
            title="Add budget"
            className={cardPrimaryButtonClass}
          >
            <Plus size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {isPending ? (
        <div role="status" className="p-3 text-sm text-slate-400">
          Loading budgets…
        </div>
      ) : hasError ? (
        <div role="alert" className="flex items-center justify-between gap-3 p-3 text-sm text-red-200">
          <span>
            {budgetsQuery.error?.message ||
              transactionsQuery.error?.message ||
              categoriesQuery.error?.message ||
              accountsQuery.error?.message ||
              "Could not load budget progress."}
          </span>
          <button
            type="button"
            onClick={() => {
              void budgetsQuery.refetch();
              void transactionsQuery.refetch();
              void categoriesQuery.refetch();
              void accountsQuery.refetch();
            }}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : budgetProgress.length === 0 ? (
        <div className="p-3">
          <p className="text-sm font-medium text-white">No budgets for this month</p>
          <p className="mt-1 text-sm text-slate-400">
            Set a monthly limit per category to see progress here.
          </p>
          <Link href="/budgets" className="mt-2 inline-block text-sm font-semibold text-yellow-300 hover:underline">
            Create your first budget
          </Link>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto p-3">
          {budgetProgress.slice(0, 3).map((item) => (
            <div key={item.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-slate-300">{item.name}</span>
                <span className={`shrink-0 font-medium ${item.over ? "text-red-300" : "text-white"}`}>
                  {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${item.over ? "bg-red-400" : "bg-yellow-400"}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <p className={`mt-1 text-xs ${item.over ? "text-red-300" : "text-slate-500"}`}>
                {item.over
                  ? `Over budget by ${formatCurrency(item.spent - item.limit)}`
                  : `${formatCurrency(Math.max(item.limit - item.spent, 0))} left`}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentTransaction({
  transaction,
  account,
}: {
  transaction: TransactionRecord;
  account: AccountDetails | undefined;
}) {
  const increasesNetWorth = isLiabilityAccount(account?.type, account?.balance)
    ? transaction.debitCredit.toLowerCase() === "debit"
    : transaction.debitCredit.toLowerCase() === "credit";
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          increasesNetWorth ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-700/60 text-slate-300"
        }`}>
          {increasesNetWorth ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {transaction.description || (increasesNetWorth ? "Balance increased" : "Balance decreased")}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{formatDate(transaction.created)}</p>
        </div>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${increasesNetWorth ? "text-emerald-300" : "text-slate-200"}`}>
        {increasesNetWorth ? "+" : "−"}{formatCurrency(transaction.amount)}
      </p>
    </li>
  );
}

function getCategoryActivity(
  transactions: TransactionRecord[],
  categories: Category[],
  accounts: AccountDetails[]
) {
  const totals = new Map<number, number>();
  for (const transaction of transactions) {
    if (!isExpense(transaction, categories, accounts)) {
      continue;
    }
    const categoryId = transaction.categoryId ?? 0;
    totals.set(
      categoryId,
      (totals.get(categoryId) ?? 0) + transaction.amount
    );
  }
  return Array.from(totals, ([id, amount]) => ({
    id,
    amount,
    name: id === 0
      ? "Uncategorized"
      : categories.find((category) => Number(category.id) === id)?.name ?? "Category",
  })).sort((left, right) => right.amount - left.amount);
}

function getBudgetProgress(
  budgets: BudgetRecord[],
  categories: Category[],
  categoryActivity: { id: number; amount: number; name: string }[]
): BudgetProgressItem[] {
  const now = new Date();
  return budgets
    .filter(
      (budget) =>
        budget.isActive !== false &&
        budget.year === now.getFullYear() &&
        budget.month === now.getMonth() + 1
    )
    .map((budget) => {
      const activity = categoryActivity.find(
        (item) => item.id === budget.categoryId
      );
      const spent = activity?.amount ?? 0;
      const limit = budget.amount;
      return {
        id: budget.id,
        name:
          activity?.name ??
          categories.find((category) => Number(category.id) === budget.categoryId)
            ?.name ??
          `Category #${budget.categoryId}`,
        spent,
        limit,
        percent: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0,
        over: spent > limit,
      };
    })
    .sort((left, right) => usage(right) - usage(left));
}

function usage(item: { spent: number; limit: number }) {
  return item.limit > 0 ? item.spent / item.limit : 0;
}

interface BudgetProgressItem {
  id: string;
  name: string;
  spent: number;
  limit: number;
  percent: number;
  over: boolean;
}

function isExpense(
  transaction: TransactionRecord,
  categories: Category[],
  accounts: AccountDetails[]
) {
  const category = categories.find(
    (item) => Number(item.id) === transaction.categoryId
  );
  if (category) return category.type === "NEED" || category.type === "WANT";
  const account = accounts.find(
    (account) => Number(account.id) === transaction.accountId
  );
  return isLiabilityAccount(account?.type, account?.balance)
    ? transaction.debitCredit.toLowerCase() === "credit"
    : transaction.debitCredit.toLowerCase() === "debit";
}

function isLiabilityAccount(accountType: string | undefined, balance?: number) {
  return (
    accountType === "CREDIT_CARD" ||
    accountType === "LOAN" ||
    (accountType === "FRIEND" && balance != null && balance < 0)
  );
}

function isCurrentMonth(transaction: TransactionRecord) {
  const created = new Date(transaction.created);
  const now = new Date();
  return (
    !Number.isNaN(created.getTime()) &&
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth()
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}
