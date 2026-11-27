import { Landmark } from "lucide-react";
import NetWorthBreakdownBar from "./NetWorthBreakdownBar";
import PeriodBalanceDetails, { formatCurrency } from "./PeriodBalanceDetails";
import type { BalanceComparison, NetWorthBreakdown } from "./periodBalance";

type NetWorthCardProps = {
  value: number | null;
  breakdown: NetWorthBreakdown | null;
  comparison: BalanceComparison | null;
  periodLabel: string;
  loading: boolean;
  unavailable: boolean;
};

export default function NetWorthCard({
  value,
  breakdown,
  comparison,
  periodLabel,
  loading,
  unavailable,
}: NetWorthCardProps) {
  const formattedValue =
    value !== null && Number.isFinite(value) ? formatCurrency(value) : "—";

  return (
    <article className="flex h-full min-h-[212px] min-w-0 flex-col rounded-xl border border-yellow-400/25 bg-gradient-to-br from-[#111a2e] via-[#0b1220] to-[#020617] p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
            <Landmark size={16} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">Net Worth</h2>
            <p className="truncate text-[11px] text-slate-400">
              Assets minus liabilities
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
          Total
        </span>
      </div>

      <div className="mt-2">
        <p className="text-xl font-bold text-yellow-300">{formattedValue}</p>
        {value === null && (
          <p className="mt-1 text-[11px] text-slate-500">
            Net worth unavailable
          </p>
        )}
      </div>

      <div className="mt-auto">
        <NetWorthBreakdownBar breakdown={breakdown} />
        <PeriodBalanceDetails
          comparison={comparison}
          periodLabel={periodLabel}
          loading={loading}
          unavailable={unavailable}
          compact
        />
      </div>
    </article>
  );
}
