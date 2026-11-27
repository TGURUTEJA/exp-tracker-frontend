"use client";

import { CalendarDays, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import CalendarPopover from "./CalendarPopover";
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

const ACCOUNT_PAGE_NAMES: Record<string, string> = {
  bank: "Bank accounts",
  credit_card: "Credit cards",
  cash: "Cash accounts",
  loan: "Loans",
  investment: "Investments",
  friend: "Friends",
};

function getPageName(pathname: string | null): string {
  if (!pathname || pathname === "/") return "Dashboard";
  if (pathname.startsWith("/transactions")) return "Transactions";
  if (pathname.startsWith("/budgets")) return "Budgets";
  if (pathname.startsWith("/categories")) return "Categories";
  const accountSlug = pathname.startsWith("/account/")
    ? pathname.split("/")[2]?.toLowerCase()
    : undefined;
  return accountSlug ? ACCOUNT_PAGE_NAMES[accountSlug] ?? "Accounts" : "Dashboard";
}

function parseYMD(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function pillClass(active: boolean) {
  return [
    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-150",
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
  const pathname = usePathname();
  const pageName = getPageName(pathname);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);
  const displayDate =
    period === "daily" ? parseYMD(dailyRange.end) ?? new Date() : new Date();

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm">
      <div className="flex min-w-0 flex-col gap-2 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              aria-expanded={calendarOpen}
              aria-label="Choose date"
              className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-400/20"
            >
              <CalendarDays size={13} />
              {formatDateLabel(displayDate)}
            </button>
            {calendarOpen ? <CalendarPopover onClose={closeCalendar} /> : null}
          </div>
        </div>

        <div className="relative w-full lg:max-w-[12rem] lg:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (coming soon)…"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 py-1.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
            aria-label="Search"
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 lg:inline">
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

          <div className="hidden h-6 w-px bg-slate-700 lg:block" aria-hidden />

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-slate-500">
              Period
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
              className="min-w-[7.5rem] cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-slate-100 outline-none transition-colors hover:border-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
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
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              <span className="text-xs text-slate-500">Range</span>
              <input
                type="date"
                value={dailyRange.start}
                onChange={(e) => setDailyStart(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                aria-label="Range start"
              />
              <span className="text-slate-500">–</span>
              <input
                type="date"
                value={dailyRange.end}
                onChange={(e) => setDailyEnd(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                aria-label="Range end"
              />
            </div>
          )}

          <span
            aria-current="page"
            className="ml-auto whitespace-nowrap rounded-md border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold text-yellow-300 lg:ml-0"
          >
            {pageName}
          </span>
        </div>
      </div>
    </header>
  );
}
