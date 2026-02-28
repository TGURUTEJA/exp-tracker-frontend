import { getAccountdata, getUserData } from "@/app/actions";
import { queryOptions, useQuery,useSuspenseQuery } from "@tanstack/react-query";

export function getuserDatafunc() {
    return useSuspenseQuery( queryOptions({
    queryKey: ['dashboard'],
    queryFn:  () => getUserData(),// disable automatic query on mount
    throwOnError: true,
    }));
} 

export function getAccountDatafunc() {
    return useSuspenseQuery( queryOptions({
    queryKey: ['AccountData'],
    queryFn:  () => getAccountdata(),// disable automatic query on mount
    throwOnError: true,
    }));
}