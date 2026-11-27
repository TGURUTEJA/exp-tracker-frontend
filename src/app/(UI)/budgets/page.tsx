"use client";

import {
  createBudget,
  deleteBudget,
  getBudgets,
  getCategories,
  updateBudget,
} from "@/app/actions";
import type { BudgetPayload, BudgetRecord } from "@/types/BudgetTypes";
import PageHeader from "@/components/UI/PageHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Wallet, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = {
  categoryId: string;
  year: string;
  month: string;
  amount: string;
  isActive: boolean;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function emptyForm(): FormState {
  const now = new Date();
  return {
    categoryId: "",
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    amount: "",
    isActive: true,
  };
}

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const budgetsQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const budgets = Array.isArray(budgetsQuery.data) ? budgetsQuery.data : [];
  const categories =
    categoriesQuery.data && !categoriesQuery.data.error
      ? categoriesQuery.data.data ?? []
      : [];

  const sortedBudgets = [...budgets].sort(
    (left, right) =>
      right.year * 100 + right.month - (left.year * 100 + left.month)
  );

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: BudgetPayload = {
      categoryId: Number(form.categoryId),
      year: Number(form.year),
      month: Number(form.month),
      amount: Number(form.amount),
      isActive: form.isActive,
    };

    try {
      const response = editingId
        ? await updateBudget(editingId, payload)
        : await createBudget(payload);
      if (response.error) {
        throw new Error(response.message || "Budget could not be saved");
      }
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setSuccessMessage(editingId ? "Budget updated." : "Budget created.");
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Budget could not be saved."
      );
    }
  };

  const handleEdit = (budget: BudgetRecord) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEditingId(budget.id);
    setForm({
      categoryId: String(budget.categoryId),
      year: String(budget.year),
      month: String(budget.month),
      amount: String(budget.amount),
      isActive: budget.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (budget: BudgetRecord) => {
    if (!window.confirm("Delete this budget?")) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await deleteBudget(budget.id);
      if (response.error || !response.data) {
        throw new Error(response.message || "Budget could not be deleted");
      }
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      if (editingId === budget.id) resetForm();
      setSuccessMessage("Budget deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Budget could not be deleted."
      );
    }
  };

  const categoryName = (categoryId: number) =>
    categories.find((category) => Number(category.id) === categoryId)?.name ??
    `Category #${categoryId}`;

  return (
    <div className="space-y-3 pb-3">
      <PageHeader
        title="Budgets"
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
          {budgetsQuery.isPending ? (
            <div
              role="status"
              className="rounded-xl border border-white/10 bg-[#0b1220] p-5 text-center text-sm text-slate-400"
            >
              Loading budgets…
            </div>
          ) : budgetsQuery.isError ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-950/30 p-5 text-sm text-red-200"
            >
              <span>
                {budgetsQuery.error.message || "Could not load budgets."}
              </span>
              <button
                type="button"
                onClick={() => void budgetsQuery.refetch()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : sortedBudgets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-[#0b1220] p-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-300">
                <Wallet size={20} />
              </span>
              <p className="mt-3 font-medium text-white">No budgets yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Add your first category limit to start tracking monthly spending.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Period</th>
                      <th className="px-4 py-3 text-right font-medium">Limit</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedBudgets.map((budget) => (
                      <tr key={budget.id} className="text-slate-300">
                        <td className="px-3 py-2.5 font-medium text-white">
                          {categoryName(budget.categoryId)}
                        </td>
                        <td className="px-3 py-2.5">
                          {MONTHS[(budget.month - 1 + 12) % 12]} {budget.year}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-200">
                          {formatCurrency(budget.amount)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              budget.isActive === false
                                ? "bg-slate-700/60 text-slate-300"
                                : "bg-emerald-400/10 text-emerald-300"
                            }`}
                          >
                            {budget.isActive === false ? "Paused" : "Active"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(budget)}
                              aria-label={`Edit budget for ${categoryName(budget.categoryId)}`}
                              className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-yellow-300"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(budget)}
                              aria-label={`Delete budget for ${categoryName(budget.categoryId)}`}
                              className="rounded-md p-2 text-slate-400 hover:bg-red-950/50 hover:text-red-300"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                {editingId ? "Edit budget" : "Add budget"}
              </h2>
              <p className="text-xs text-slate-400">
                One limit per category, per month.
              </p>
            </div>
          </div>

          {categoriesQuery.isError ? (
            <p role="alert" className="mb-4 text-sm text-red-300">
              Could not load categories: {categoriesQuery.error.message}
            </p>
          ) : categories.length === 0 && !categoriesQuery.isPending ? (
            <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-950/20 p-3 text-sm text-amber-100">
              Create a category before adding budgets.{" "}
              <Link href="/categories" className="font-semibold underline">
                Go to categories
              </Link>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs text-slate-400">
              Category
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({ ...form, categoryId: event.target.value })
                }
                className={inputClass}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">
                Month
                <select
                  required
                  value={form.month}
                  onChange={(event) =>
                    setForm({ ...form, month: event.target.value })
                  }
                  className={inputClass}
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-slate-400">
                Year
                <input
                  type="number"
                  min="1970"
                  max="2100"
                  required
                  value={form.year}
                  onChange={(event) =>
                    setForm({ ...form, year: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-xs text-slate-400">
              Spending limit
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="0.00"
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked })
                }
                className="h-4 w-4 accent-yellow-400"
              />
              Active (include in dashboard progress)
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={categoriesQuery.isPending || categories.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? <Pencil size={15} /> : <Plus size={17} />}
                {editingId ? "Save changes" : "Add budget"}
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

const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/70";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
