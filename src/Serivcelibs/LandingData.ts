import { getAccountdata, getUserData } from "@/app/actions";
import { queryOptions } from "@tanstack/react-query";

/** Use with `useSuspenseQuery` / `useQuery` in a component — hooks cannot run in plain functions. */
export const dashboardUserQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => getUserData(),
    throwOnError: true,
  });

export const accountDataQueryOptions = () =>
  queryOptions({
    queryKey: ["AccountData"],
    queryFn: () => getAccountdata(),
    throwOnError: true,
  });
