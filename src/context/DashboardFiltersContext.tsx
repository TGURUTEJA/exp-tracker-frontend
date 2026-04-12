"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TransactionView = "all" | "income" | "expense";

export type PeriodPreset = "yearly" | "monthly" | "weekly" | "daily";

export type DailyDateRange = {
  start: string;
  end: string;
};

function formatLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultLast30DayRange(): DailyDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: formatLocalYMD(start), end: formatLocalYMD(end) };
}

type DashboardFiltersContextValue = {
  view: TransactionView;
  setView: (v: TransactionView) => void;
  period: PeriodPreset;
  setPeriod: (p: PeriodPreset) => void;
  dailyRange: DailyDateRange;
  setDailyRange: (r: DailyDateRange) => void;
  setDailyStart: (start: string) => void;
  setDailyEnd: (end: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | null>(
  null
);

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<TransactionView>("all");
  const [period, setPeriodState] = useState<PeriodPreset>("monthly");
  const [dailyRange, setDailyRange] = useState<DailyDateRange>(defaultLast30DayRange);
  const [searchQuery, setSearchQuery] = useState("");

  const setPeriod = useCallback((p: PeriodPreset) => {
    setPeriodState(p);
    if (p === "daily") {
      setDailyRange(defaultLast30DayRange());
    }
  }, []);

  const setDailyStart = useCallback((start: string) => {
    setDailyRange((prev) => ({ ...prev, start }));
  }, []);

  const setDailyEnd = useCallback((end: string) => {
    setDailyRange((prev) => ({ ...prev, end }));
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      period,
      setPeriod,
      dailyRange,
      setDailyRange,
      setDailyStart,
      setDailyEnd,
      searchQuery,
      setSearchQuery,
    }),
    [
      view,
      period,
      setPeriod,
      dailyRange,
      setDailyStart,
      setDailyEnd,
      searchQuery,
    ]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters(): DashboardFiltersContextValue {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within DashboardFiltersProvider");
  }
  return ctx;
}
