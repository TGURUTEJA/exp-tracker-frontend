import { getAccountdata } from "@/app/actions";
import { getQueryClient } from "@/provider/GetQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

export default async function CategoriesPageTQ({ children }: Props) {
    const queryClient = getQueryClient();
    const PromiseList: Promise<unknown>[] = [];
    PromiseList.push(
        queryClient.prefetchQuery({
            queryKey: ['AccountSummary'],
            queryFn:  () => getAccountdata(),
          })
    );
    await Promise.all(PromiseList);
    console.log(queryClient);
  
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    );
}