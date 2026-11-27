"use client";

import { getAccountdata, getTransactionHistory } from "@/app/actions";
import type { AccountDetailsResponse } from "@/types/AccountTyes";
import type { AccountTransaction } from "@/types/TransactionTypes";
import { useQuery } from "@tanstack/react-query";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import NetWorthBreakdownBar from "./NetWorthBreakdownBar";
import PeriodBalanceDetails, {
  formatCurrency,
} from "./PeriodBalanceDetails";
import {
  getNetWorthBreakdown,
  getNetWorthComparison,
  getPeriodWindow,
} from "./periodBalance";

export default function NetWorthStatusCard() {
  const { period, dailyRange } = useDashboardFilters();
  const accountQuery = useQuery<AccountDetailsResponse>({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const transactionQuery = useQuery<AccountTransaction[]>({
    queryKey: ["TransactionHistory"],
    queryFn: getTransactionHistory,
  });

  const accounts = accountQuery.data?.data?.accountDetailsList ?? [];
  const accountSummary = accountQuery.data?.data?.accountSummary;
  const breakdown =
    accounts.length > 0 ? getNetWorthBreakdown(accounts) : null;
  const netWorth = breakdown
    ? breakdown.assets - breakdown.liabilities
    : accountSummary?.netWorth ?? null;
  const periodWindow = getPeriodWindow(period, dailyRange);
  const comparison =
    accounts.length > 0 &&
    !accountQuery.isPending &&
    !transactionQuery.isPending &&
    !accountQuery.isError &&
    !transactionQuery.isError
      ? getNetWorthComparison(
          accounts,
          transactionQuery.data ?? [],
          periodWindow
        )
      : null;

  return (
    <section
      aria-label="Net Worth"
      className="flex h-full min-h-[212px] min-w-0 flex-col rounded-xl border border-yellow-400/25 bg-gradient-to-br from-[#111a2e] via-[#0b1220] to-[#020617] p-3 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 leading-tight">
          <h2 className="truncate text-sm font-semibold text-white">Net Worth</h2>
          <p className="text-[11px] text-slate-400">Assets minus liabilities</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Total</p>
          <p
            className="text-base font-bold leading-tight text-yellow-300"
            aria-label={
              netWorth === null
                ? "Net worth unavailable"
                : `Net worth ${formatCurrency(netWorth)}`
            }
          >
            {accountQuery.isPending
              ? "Loading"
              : accountQuery.isError || netWorth === null
                ? "Unavailable"
                : formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2">
          <NetWorthPieChart breakdown={breakdown} />
          <div className="min-w-0 flex-1">
            <NetWorthBreakdownBar breakdown={breakdown} />
          </div>
        </div>
        <PeriodBalanceDetails
          comparison={comparison}
          periodLabel={periodWindow.label}
          loading={accountQuery.isPending || transactionQuery.isPending}
          unavailable={
            accountQuery.isError ||
            transactionQuery.isError ||
            accountQuery.data?.error === true
          }
          compact
        />
      </div>
    </section>
  );
}

function NetWorthPieChart({
  breakdown,
}: {
  breakdown: ReturnType<typeof getNetWorthBreakdown> | null;
}) {
  const total = breakdown
    ? breakdown.assets + breakdown.liabilities
    : 0;
  const assetsShare = breakdown && total > 0 ? breakdown.assets / total : 0;
  const liabilitiesShare =
    breakdown && total > 0 ? breakdown.liabilities / total : 0;
  const assetsEndAngle = -90 + assetsShare * 360;

  return (
    <svg
      viewBox="0 0 36 36"
      role="img"
      aria-label={
        breakdown
          ? `Net worth composition: ${formatCurrency(breakdown.assets)} in assets and ${formatCurrency(breakdown.liabilities)} in liabilities`
          : "Net worth composition unavailable"
      }
      className="h-12 w-12 shrink-0"
    >
      {!breakdown || total <= 0 ? (
        <circle cx="18" cy="18" r="17" fill="#334155" />
      ) : assetsShare >= 1 ? (
        <circle cx="18" cy="18" r="17" fill="#34d399" />
      ) : liabilitiesShare >= 1 ? (
        <circle cx="18" cy="18" r="17" fill="#fb7185" />
      ) : (
        <>
          <path
            d={getPieSlicePath(-90, assetsEndAngle)}
            fill="#34d399"
            stroke="#0b1220"
            strokeWidth="0.5"
          />
          <path
            d={getPieSlicePath(assetsEndAngle, 270)}
            fill="#fb7185"
            stroke="#0b1220"
            strokeWidth="0.5"
          />
        </>
      )}
    </svg>
  );
}

function getPieSlicePath(startAngle: number, endAngle: number) {
  const radius = 17;
  const center = 18;
  const start = getPiePoint(startAngle, center, radius);
  const end = getPiePoint(endAngle, center, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function getPiePoint(angle: number, center: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}
