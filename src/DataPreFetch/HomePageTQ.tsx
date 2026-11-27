import { getAccountdata, getBudgets, getCategories, getTransactions } from "@/app/actions";
import { getQueryClient } from "@/provider/GetQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

export default async function HomePageTQ({ children }: Props) {
    const queryClient = getQueryClient();
    const PromiseList: Promise<unknown>[] = [];
    PromiseList.push(
        queryClient.prefetchQuery({
            queryKey: ['AccountSummary'],
            queryFn:  () => getAccountdata(),// disable automatic query on mount
          })
    );
    PromiseList.push(
      queryClient.prefetchQuery({
        queryKey: ["transactions", "all"],
        queryFn: () => getTransactions(),
      })
    );
    PromiseList.push(
      queryClient.prefetchQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
      })
    );
    PromiseList.push(
      queryClient.prefetchQuery({
        queryKey: ["budgets"],
        queryFn: () => getBudgets(),
      })
    );
    await Promise.all(PromiseList);
  
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    );
}