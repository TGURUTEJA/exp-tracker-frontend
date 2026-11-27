import type { BalanceComparison } from "./periodBalance";

interface PeriodBalanceDetailsProps {
  comparison: BalanceComparison | null;
  periodLabel: string;
  currency?: string;
  loading?: boolean;
  unavailable?: boolean;
  higherIsBetter?: boolean;
}

export default function PeriodBalanceDetails({
  comparison,
  periodLabel,
  currency = "INR",
  loading = false,
  unavailable = false,
  higherIsBetter = true,
}: PeriodBalanceDetailsProps) {
  if (!comparison) {
    const message = loading
      ? "Loading period history..."
      : unavailable
        ? "Period comparison unavailable"
        : "No balance history for this period";

    return (
      <p role={loading ? "status" : "note"} className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
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
    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 pt-3 text-xs">
      <div>
        <dt className="text-slate-500">{periodLabel} starting balance</dt>
        <dd className="mt-1 font-medium text-slate-200">
          {formatCurrency(comparison.start, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Current balance</dt>
        <dd className="mt-1 font-medium text-slate-200">
          {formatCurrency(comparison.current, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Difference</dt>
        <dd className={`mt-1 font-semibold ${differenceTone}`}>
          {formatSignedCurrency(comparison.change, currency)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Change (%)</dt>
        <dd className={`mt-1 font-semibold ${differenceTone}`}>
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
