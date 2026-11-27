"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import TopBar from "@/components/TopBar/TopBar";
import { DashboardFiltersProvider } from "@/context/DashboardFiltersContext";
import ProfileCompletionGate from "@/components/UserProfileCard/ProfileCompletionGate";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isDashboard = usePathname() === "/";

  return (
    <ProfileCompletionGate>
      <div className="flex h-screen h-dvh min-w-0 overflow-hidden">
        <NavBar />
        <DashboardFiltersProvider>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TopBar />
            <main
              className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overscroll-contain bg-[#080b12] p-3 text-slate-100 sm:p-4 ${
                isDashboard ? "overflow-y-auto xl:overflow-y-hidden" : "overflow-y-auto"
              }`}
            >
              <div
                className={`mx-auto w-full max-w-[1600px] ${
                  isDashboard ? "xl:flex xl:h-full xl:min-h-0 xl:flex-col" : ""
                }`}
              >
                {children}
              </div>
            </main>
          </div>
        </DashboardFiltersProvider>
      </div>
    </ProfileCompletionGate>
  );
}
