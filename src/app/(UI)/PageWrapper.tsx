import AccountSummary from "@/components/Account/AccountSummary";
import HomePageTQ from "@/DataPreFetch/HomePageTQ";

export default function PageWrapper() {


  return <>
    <HomePageTQ>
      <AccountSummary />
    </HomePageTQ>
  </>;
}