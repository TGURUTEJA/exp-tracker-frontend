import AccountSummary from "@/components/Account/AccountSummary";
import NetWorthStatusCard from "@/components/Account/NetWorthStatusCard";
import HomeDashboard, { CategoryActivityCard } from "@/components/DashBoard/HomeDashboard";
import HomePageTQ from "@/DataPreFetch/HomePageTQ";

export default function PageWrapper() {
  return (
    <HomePageTQ>
      <div className="space-y-3 pb-3 xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,4fr)_minmax(0,11fr)_minmax(0,5fr)] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-3 xl:space-y-0 xl:pb-0">
        <div className="xl:col-span-1">
          <NetWorthStatusCard />
        </div>
        <AccountSummary className="xl:col-span-1" />
        <div className="xl:col-span-1">
          <CategoryActivityCard />
        </div>
        <div className="xl:col-span-3 xl:min-h-0">
          <HomeDashboard />
        </div>
      </div>
    </HomePageTQ>
  );
}
