"use client";

import { getAccountdata, getCategories, getTransactions } from "@/app/actions";
import type { AccountDetails } from "@/types/AccountTyes";
import type { Category } from "@/app/actions";
import type { TransactionRecord } from "@/types/TransactionTypes";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, ArrowUpRightFromSquare, Tags } from "lucide-react";
import Link from "next/link";

export default function HomeDashboard() {
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

  const transactions = transactionsQuery.data ?? [];
  const accounts = accountsQuery.data?.data?.accountDetailsList ?? [];
  const categories =
    categoriesQuery.data && !categoriesQuery.data.error
      ? categoriesQuery.data.data ?? []
      : [];
  const monthTransactions = transactions.filter(isCurrentMonth);
  const monthlySpending = monthTransactions
    .filter((transaction) => isExpense(transaction, categories, accounts))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const categoryActivity = getCategoryActivity(monthTransactions, categories, accounts);

  return (
    <section className="space-y-4" aria-label="Transaction and category overview">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold text-white">Activity &amp; spending</h2>
          <p className="mt-1 text-sm text-slate-400">
            Recent activity and category spending for this month.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
          >
            <ArrowUpRight size={16} />
            Add transaction
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            <Tags size={16} />
            Categories
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
        <div className="rounded-2xl border border-white/10 bg-[#0b1220]">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Recent transactions</h2>
              <p className="mt-0.5 text-xs text-slate-500">Latest account activity</p>
            </div>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-300 hover:text-yellow-200"
            >
              View all <ArrowUpRightFromSquare size={13} />
            </Link>
          </div>
          {transactionsQuery.isPending ? (
            <div role="status" className="p-6 text-sm text-slate-400">Loading activity…</div>
          ) : transactionsQuery.isError ? (
            <div role="alert" className="flex items-center justify-between gap-3 p-5 text-sm text-red-200">
              <span>{transactionsQuery.error.message || "Could not load recent activity."}</span>
              <button type="button" onClick={() => void transactionsQuery.refetch()} className="font-semibold underline">Retry</button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6">
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

        <div className="rounded-2xl border border-white/10 bg-[#0b1220]">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="font-semibold text-white">Category activity</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatCurrency(monthlySpending)} spent this month
            </p>
          </div>
          {categoriesQuery.isPending || transactionsQuery.isPending || accountsQuery.isPending ? (
            <div role="status" className="p-6 text-sm text-slate-400">Loading categories…</div>
          ) : categoriesQuery.isError || categoriesQuery.data?.error || accountsQuery.isError ? (
            <div role="alert" className="flex items-center justify-between gap-3 p-5 text-sm text-red-200">
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
            <div className="p-6">
              <p className="text-sm text-slate-400">
                {monthTransactions.length === 0
                  ? "Category totals will appear after you add transactions."
                  : "No categorized expenses this month."}
              </p>
              <Link href="/categories" className="mt-3 inline-block text-sm font-semibold text-yellow-300 hover:underline">
                Manage categories
              </Link>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {categoryActivity.slice(0, 5).map((item) => {
                const width =
                  monthlySpending > 0
                    ? Math.min((item.amount / monthlySpending) * 100, 100)
                    : 0;
                return (
                  <div key={item.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-slate-300">{item.name}</span>
                      <span className="shrink-0 font-medium text-white">{formatCurrency(item.amount)}</span>
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
              <Link href="/categories" className="inline-block pt-1 text-xs font-semibold text-yellow-300 hover:underline">
                View categories
              </Link>
            </div>
          )}
        </div>
      </div>
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
    <li className="flex items-center justify-between gap-3 px-5 py-3.5">
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
