"use client";

import {
  createTransaction,
  deleteTransaction,
  getAccountdata,
  getCategories,
  getTransactions,
  updateTransaction,
} from "@/app/actions";
import type {
  TransactionFilters,
  TransactionPayload,
  TransactionRecord,
} from "@/types/TransactionTypes";
import type { AccountDetails } from "@/types/AccountTyes";
import PageHeader from "@/components/UI/PageHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type FormState = {
  accountId: string;
  categoryId: string;
  amount: string;
  kind: "expense" | "income";
  created: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  accountId: "",
  categoryId: "",
  amount: "",
  kind: "expense",
  created: toDateTimeInput(new Date()),
  description: "",
};

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filters = useMemo<TransactionFilters>(
    () => ({
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59.999999999` : undefined,
      accountId: accountFilter ? Number(accountFilter) : undefined,
      categoryId: categoryFilter ? Number(categoryFilter) : undefined,
    }),
    [accountFilter, categoryFilter, endDate, startDate]
  );
  const transactionQuery = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => getTransactions(filters),
  });
  const accountsQuery = useQuery({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const accounts = accountsQuery.data?.data?.accountDetailsList ?? [];
  const categories =
    categoriesQuery.data && !categoriesQuery.data.error
      ? categoriesQuery.data.data ?? []
      : [];
  const transactions = transactionQuery.data ?? [];

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, created: toDateTimeInput(new Date()) });
    setEditingId(null);
  };

  const refreshRelatedData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["TransactionHistory"] }),
      queryClient.invalidateQueries({ queryKey: ["AccountSummary"] }),
    ]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: TransactionPayload = {
      accountId: Number(form.accountId),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      amount: Number(form.amount),
      debitCredit: getBalanceDirection(
        form.kind,
        accounts.find((account) => Number(account.id) === Number(form.accountId))
      ),
      created: form.created,
      description: form.description.trim(),
    };

    try {
      const response = editingId
        ? await updateTransaction(editingId, payload)
        : await createTransaction(payload);
      if (response.error) throw new Error(response.message || "Transaction could not be saved");
      await refreshRelatedData();
      setSuccessMessage(editingId ? "Transaction updated." : "Transaction created.");
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Transaction could not be saved."
      );
    }
  };

  const handleEdit = (transaction: TransactionRecord) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEditingId(transaction.id);
    const accountType = accounts.find(
      (account) => Number(account.id) === transaction.accountId
    );
    const isLiability = isLiabilityAccount(accountType?.type, accountType?.balance);
    const increasesNetWorth = isLiability
      ? transaction.debitCredit.toLowerCase() === "debit"
      : transaction.debitCredit.toLowerCase() === "credit";
    setForm({
      accountId: String(transaction.accountId),
      categoryId: transaction.categoryId == null ? "" : String(transaction.categoryId),
      amount: String(transaction.amount),
      kind: increasesNetWorth ? "income" : "expense",
      created: transaction.created.slice(0, 16),
      description: transaction.description ?? "",
    });
  };

  const handleDelete = async (transaction: TransactionRecord) => {
    if (!window.confirm("Delete this transaction? This will also update the account balance.")) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await deleteTransaction(transaction.id);
      if (response.error || !response.data) {
        throw new Error(response.message || "Transaction could not be deleted");
      }
      await refreshRelatedData();
      if (editingId === transaction.id) resetForm();
      setSuccessMessage("Transaction deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Transaction could not be deleted."
      );
    }
  };

  const accountName = (accountId: number) =>
    accounts.find((account) => Number(account.id) === accountId)?.displayName ??
    `Account #${accountId}`;
  const categoryName = (categoryId: number | null) =>
    categoryId == null
      ? "Uncategorized"
      : categories.find((category) => Number(category.id) === categoryId)?.name ??
        "Uncategorized";

  return (
    <div className="space-y-3 pb-3">
      <PageHeader
        title="Transactions"
        actions={
          <Link
            href="/categories"
            className="text-xs font-semibold text-yellow-300 underline-offset-4 hover:underline"
          >
            Manage categories
          </Link>
        }
      />

      {(errorMessage || successMessage) && (
        <div
          role={errorMessage ? "alert" : "status"}
          className={`rounded-lg border px-4 py-3 text-sm ${
            errorMessage
              ? "border-red-500/30 bg-red-950/30 text-red-200"
              : "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{errorMessage || successMessage}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0 space-y-3">
          <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-white">Activity</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setAccountFilter("");
                  setCategoryFilter("");
                }}
                className="text-xs font-medium text-yellow-300 hover:text-yellow-200"
              >
                Clear filters
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-slate-400">
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={filterInputClass}
                />
              </label>
              <label className="text-xs text-slate-400">
                To
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={filterInputClass}
                />
              </label>
              <label className="text-xs text-slate-400">
                Account
                <select
                  value={accountFilter}
                  onChange={(event) => setAccountFilter(event.target.value)}
                  className={filterInputClass}
                >
                  <option value="">All accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Category
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={filterInputClass}
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {transactionQuery.isPending ? (
            <div role="status" className="rounded-xl border border-white/10 bg-[#0b1220] p-5 text-center text-sm text-slate-400">
              Loading transactions…
            </div>
          ) : transactionQuery.isError ? (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-950/30 p-5 text-sm text-red-200">
              <span>{transactionQuery.error.message || "Could not load transactions."}</span>
              <button type="button" onClick={() => void transactionQuery.refetch()} className="font-semibold underline">
                Retry
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-[#0b1220] p-6 text-center">
              <p className="font-medium text-white">No transactions found</p>
              <p className="mt-1 text-sm text-slate-400">
                Add your first transaction or adjust the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Transaction</th>
                      <th className="px-4 py-3 font-medium">Account</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((transaction) => {
                      const account = accounts.find(
                        (account) => Number(account.id) === transaction.accountId
                      );
                      const increasesNetWorth = isLiabilityAccount(account?.type, account?.balance)
                        ? transaction.debitCredit.toLowerCase() === "debit"
                        : transaction.debitCredit.toLowerCase() === "credit";
                      return (
                        <tr key={transaction.id} className="text-slate-300">
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-white">
                              {transaction.description || (increasesNetWorth ? "Balance increased" : "Balance decreased")}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatTransactionDate(transaction.created)}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">{accountName(transaction.accountId)}</td>
                          <td className="px-3 py-2.5">{categoryName(transaction.categoryId)}</td>
                          <td className={`px-3 py-2.5 text-right font-semibold ${increasesNetWorth ? "text-emerald-300" : "text-slate-200"}`}>
                            <span className="inline-flex items-center justify-end gap-1">
                              {increasesNetWorth ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                              {increasesNetWorth ? "+" : "−"}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(transaction)}
                                aria-label={`Edit ${transaction.description || "transaction"}`}
                                className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-yellow-300"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(transaction)}
                                aria-label={`Delete ${transaction.description || "transaction"}`}
                                className="rounded-md p-2 text-slate-400 hover:bg-red-950/50 hover:text-red-300"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="h-fit rounded-xl border border-white/10 bg-[#0b1220] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
              {editingId ? <Pencil size={18} /> : <Plus size={19} />}
            </span>
            <div>
              <h2 className="font-semibold text-white">
                {editingId ? "Edit transaction" : "Add transaction"}
              </h2>
              <p className="text-xs text-slate-500">Amounts must be positive.</p>
            </div>
          </div>

          {accountsQuery.isError ? (
            <p role="alert" className="mb-4 text-sm text-red-300">
              Could not load accounts: {accountsQuery.error.message}
            </p>
          ) : accounts.length === 0 && !accountsQuery.isPending ? (
            <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-950/20 p-3 text-sm text-amber-100">
              Create an account before adding transactions.{" "}
              <Link href="/" className="font-semibold underline">Go to home</Link>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs text-slate-400">
              Account
              <select
                required
                value={form.accountId}
                onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                className={filterInputClass}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.displayName}</option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-slate-400">
              Type
              <select
                value={form.kind}
                onChange={(event) => setForm({ ...form, kind: event.target.value as FormState["kind"] })}
                className={filterInputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label className="block text-xs text-slate-400">
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="0.00"
                className={filterInputClass}
              />
            </label>

            <label className="block text-xs text-slate-400">
              Category <span className="text-slate-500">(optional)</span>
              <select
                value={form.categoryId}
                onChange={(event) => {
                  const categoryId = event.target.value;
                  const category = categories.find((item) => String(item.id) === categoryId);
                  setForm({
                    ...form,
                    categoryId,
                    kind: category
                      ? category.type === "INCOME"
                        ? "income"
                        : "expense"
                      : form.kind,
                  });
                }}
                className={filterInputClass}
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-slate-400">
              Date and time
              <input
                type="datetime-local"
                required
                value={form.created}
                onChange={(event) => setForm({ ...form, created: event.target.value })}
                className={filterInputClass}
              />
            </label>

            <label className="block text-xs text-slate-400">
              Description
              <input
                type="text"
                maxLength={240}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="e.g. Groceries"
                className={filterInputClass}
              />
            </label>

            {categoriesQuery.isError && (
              <p role="alert" className="text-xs text-amber-200">
                Categories could not be loaded. You can still save this as uncategorized.
              </p>
            )}
            <p className="text-xs leading-relaxed text-slate-500">
              The selected account controls the balance direction. For credit cards and loans,
              an expense increases the amount owed and an income reduces it.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={accountsQuery.isPending || accounts.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? <Pencil size={15} /> : <Plus size={17} />}
                {editingId ? "Save changes" : "Add transaction"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/10 px-3 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

const filterInputClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/70";

function toDateTimeInput(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function getBalanceDirection(
  kind: FormState["kind"],
  account: AccountDetails | undefined
): "credit" | "debit" {
  const isLiability = isLiabilityAccount(account?.type, account?.balance);
  if (isLiability) return kind === "expense" ? "credit" : "debit";
  return kind === "expense" ? "debit" : "credit";
}

function isLiabilityAccount(accountType: string | undefined, balance?: number) {
  return (
    accountType === "CREDIT_CARD" ||
    accountType === "LOAN" ||
    (accountType === "FRIEND" && balance != null && balance < 0)
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

function formatTransactionDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}
