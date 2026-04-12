import NavBar from "@/components/NavBar/NavBar";
import DashboardShell from "./DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0">
      <NavBar />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
