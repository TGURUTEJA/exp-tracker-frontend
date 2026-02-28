"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getUserData, getAccountdata } from "@/app/actions";

export default function DashboardUI() {
  const { data: userData } = useSuspenseQuery({
    queryKey: ["dashboard"],
    queryFn: getUserData,
    staleTime: 600000,
  });

  const { data: accountData } = useSuspenseQuery({
    queryKey: ["account"],
    queryFn: getAccountdata,
    staleTime: 600000,
  });

  return (
    <>
      <p>{JSON.stringify(userData)}</p>
      <p>{JSON.stringify(accountData)}</p>
    </>
  );
}
