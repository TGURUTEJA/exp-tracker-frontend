"use client";

import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromYMD(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

type CalendarPopoverProps = {
  onClose: () => void;
};

export default function CalendarPopover({ onClose }: CalendarPopoverProps) {
  const { dailyRange, setDailyRange, setPeriod } = useDashboardFilters();
  const selected = fromYMD(dailyRange.end) ?? new Date();
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1)
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const days = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = first.getDay();
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        viewMonth.getFullYear(),
        viewMonth.getMonth(),
        index - offset + 1
      );
      return { date, inMonth: date.getMonth() === viewMonth.getMonth() };
    });
  }, [viewMonth]);

  const selectDate = (date: Date) => {
    const ymd = toYMD(date);
    setPeriod("daily");
    setDailyRange({ start: ymd, end: ymd });
    onClose();
  };

  const shiftMonth = (delta: number) => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const today = new Date();
  const selectedYMD = toYMD(selected);
  const todayYMD = toYMD(today);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Choose date"
      className="absolute right-0 top-full z-50 mt-2 w-[18.5rem] rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/40"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map(({ date, inMonth }) => {
          const ymd = toYMD(date);
          const isSelected = ymd === selectedYMD;
          const isToday = ymd === todayYMD;
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => selectDate(date)}
              aria-label={new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(date)}
              aria-pressed={isSelected}
              className={[
                "flex h-8 w-8 items-center justify-center justify-self-center rounded-full text-xs transition",
                inMonth ? "text-slate-200" : "text-slate-600",
                isSelected
                  ? "bg-yellow-400 font-bold text-slate-950 hover:bg-yellow-300"
                  : "hover:bg-slate-800 hover:text-white",
                !isSelected && isToday
                  ? "ring-1 ring-inset ring-yellow-400/70"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
        <button
          type="button"
          onClick={() => selectDate(today)}
          className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-400/20"
        >
          Today
        </button>
        <span className="text-[11px] text-slate-500">
          Pick a date to filter
        </span>
      </div>
    </div>
  );
}
