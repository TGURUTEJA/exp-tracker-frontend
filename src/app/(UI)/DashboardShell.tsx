"use client";

import type { ReactNode } from "react";
import { DashboardFiltersProvider } from "@/context/DashboardFiltersContext";
import TopBar from "@/components/TopBar/TopBar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardFiltersProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex-1 min-w-0 overflow-x-hidden p-6">{children}</div>
      </div>
    </DashboardFiltersProvider>
  );
}
