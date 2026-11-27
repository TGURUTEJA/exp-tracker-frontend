"use client";

import { Search } from "lucide-react";
import {
  useDashboardFilters,
  type PeriodPreset,
  type TransactionView,
} from "@/context/DashboardFiltersContext";

const VIEW_OPTIONS: { id: TransactionView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const PERIOD_OPTIONS: { id: PeriodPreset; label: string }[] = [
  { id: "yearly", label: "Yearly" },
  { id: "monthly", label: "Monthly" },
  { id: "weekly", label: "Weekly" },
  { id: "daily", label: "Daily" },
];

function pillClass(active: boolean) {
  return [
    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
    active
      ? "bg-slate-600 text-white shadow-sm"
      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
  ].join(" ");
}

export default function TopBar() {
  const {
    view,
    setView,
    period,
    setPeriod,
    dailyRange,
    setDailyStart,
    setDailyEnd,
    searchQuery,
    setSearchQuery,
  } = useDashboardFilters();

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm">
      <div className="flex min-w-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 sm:inline">
            Type
          </span>
          <div
            className="inline-flex rounded-xl border border-slate-700/80 bg-slate-950/60 p-1"
            role="group"
            aria-label="Transaction type"
          >
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setView(opt.id)}
                className={pillClass(view === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="hidden h-6 w-px bg-slate-700 sm:block" aria-hidden />

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-slate-500">
              Period
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
              className="min-w-[8.5rem] cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 outline-none transition-colors hover:border-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
              aria-label="Period"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {period === "daily" && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <span className="text-xs text-slate-500">Range</span>
              <input
                type="date"
                value={dailyRange.start}
                onChange={(e) => setDailyStart(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                aria-label="Range start"
              />
              <span className="text-slate-500">–</span>
              <input
                type="date"
                value={dailyRange.end}
                onChange={(e) => setDailyEnd(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                aria-label="Range end"
              />
            </div>
          )}
        </div>

        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (coming soon)…"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
            aria-label="Search"
          />
        </div>
      </div>
    </header>
  );
}
