import AccountSummary from "@/components/Account/AccountSummary";
import HomeDashboard from "@/components/DashBoard/HomeDashboard";
import HomePageTQ from "@/DataPreFetch/HomePageTQ";

export default function PageWrapper() {
  return (
    <HomePageTQ>
      <div className="space-y-6 pb-10">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-yellow-400">Personal finance</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Your balances, latest activity, and category spending in one place.
            </p>
          </div>
        </header>
        <AccountSummary />
        <HomeDashboard />
      </div>
    </HomePageTQ>
  );
}