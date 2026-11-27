import type { NetWorthBreakdown } from "./periodBalance";

export default function NetWorthBreakdownBar({
  breakdown,
}: {
  breakdown: NetWorthBreakdown | null;
}) {
  const assets = breakdown?.assets ?? 0;
  const liabilities = breakdown?.liabilities ?? 0;
  const total = assets + liabilities;
  const assetsPercent = total > 0 ? (assets / total) * 100 : 0;
  const liabilitiesPercent = total > 0 ? (liabilities / total) * 100 : 0;

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium">
        <span className="text-emerald-300">Assets</span>
        <span className="text-rose-300">Liabilities</span>
      </div>
      <div
        role="img"
        aria-label={
          breakdown
            ? `Net worth is calculated from ${formatCurrency(assets)} in assets and ${formatCurrency(liabilities)} in liabilities`
            : "Net worth is calculated as assets minus liabilities; breakdown is unavailable"
        }
        className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-800"
      >
        {breakdown && (
          <>
            <span
              className="h-full bg-emerald-400"
              style={{ width: `${assetsPercent}%` }}
            />
            <span
              className="h-full bg-rose-400"
              style={{ width: `${liabilitiesPercent}%` }}
            />
          </>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
        <span>{breakdown ? formatCurrency(assets) : "Unavailable"}</span>
        <span>{breakdown ? formatCurrency(liabilities) : "Unavailable"}</span>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Net worth = assets - liabilities
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
