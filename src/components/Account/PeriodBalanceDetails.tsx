import type { BalanceComparison } from "./periodBalance";

interface PeriodBalanceDetailsProps {
  comparison: BalanceComparison | null;
  periodLabel: string;
  currency?: string;
  loading?: boolean;
  unavailable?: boolean;
  higherIsBetter?: boolean;
  compact?: boolean;
}

export default function PeriodBalanceDetails({
  comparison,
  periodLabel,
  currency = "INR",
  loading = false,
  unavailable = false,
  higherIsBetter = true,
  compact = false,
}: PeriodBalanceDetailsProps) {
  if (!comparison) {
    const message = loading
      ? "Loading period history..."
      : unavailable
        ? "Period comparison unavailable"
        : "No balance history for this period";

    return (
      <p role={loading ? "status" : "note"} className={`${compact ? "mt-2 pt-2" : "mt-4 pt-3"} border-t border-white/10 text-[11px] text-slate-500`}>
        {message}
      </p>
    );
  }

  const differenceTone =
    comparison.change === 0
      ? "text-slate-300"
      : (comparison.change > 0) === higherIsBetter
        ? "text-emerald-300"
        : "text-rose-300";

  return (
    <dl
      aria-label={`${periodLabel} balance comparison`}
      className={`${compact ? "mt-2 gap-x-2 gap-y-1 pt-2" : "mt-4 gap-x-4 gap-y-2 pt-3"} grid grid-cols-2 border-t border-white/10 text-[11px]`}
    >
      <div>
        <dt className="text-slate-500">Start bal</dt>
        <dd className={`${compact ? "mt-0 text-[11px]" : "mt-1 text-sm"} font-medium text-slate-200`}>
          {formatCurrency(comparison.start, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">{compact ? "End bal" : "Close bal"}</dt>
        <dd className={`${compact ? "mt-0 text-[11px]" : "mt-1 text-sm"} font-medium text-slate-200`}>
          {formatCurrency(comparison.current, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Diff</dt>
        <dd className={`${compact ? "mt-0 text-[11px]" : "mt-1 text-sm"} font-semibold ${differenceTone}`}>
          {formatSignedCurrency(comparison.change, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Change %</dt>
        <dd className={`${compact ? "mt-0 text-[11px]" : "mt-1 text-sm"} font-semibold ${differenceTone}`}>
          {comparison.percentage === null
            ? "—"
            : `${comparison.percentage > 0 ? "+" : ""}${comparison.percentage.toFixed(2)}%`}
        </dd>
      </div>
    </dl>
  );
}

export function formatCurrency(value: number, currency = "INR") {
  const formattedValue = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return currency === "INR" ? `₹${formattedValue}` : `${currency} ${formattedValue}`;
}

function formatSignedCurrency(value: number, currency: string) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}
