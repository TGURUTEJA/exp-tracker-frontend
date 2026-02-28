import { getAccountdata, getUserData } from "@/app/actions";
import { getQueryClient } from "@/provider/GetQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

export default async function HomePageTQ({ children }: Props) {
    const queryClient = getQueryClient();
    const PromiseList : Promise<any>[] = [];
    PromiseList.push(
        queryClient.prefetchQuery({
            queryKey: ['AccountSummary'],
            queryFn:  () => getAccountdata(),// disable automatic query on mount
          })
    );
    await Promise.all(PromiseList);
    console.log(queryClient);
  
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    );
}