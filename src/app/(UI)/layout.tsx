import NavBar from "@/components/NavBar/NavBar";
import TopBar from "@/components/TopBar/TopBar";
import { DashboardFiltersProvider } from "@/context/DashboardFiltersContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen h-dvh min-w-0 overflow-hidden">
      <NavBar />
      <DashboardFiltersProvider>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#080b12] p-4 text-slate-100 sm:p-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </DashboardFiltersProvider>
    </div>
  );
}
