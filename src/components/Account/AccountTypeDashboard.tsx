"use client";

import { getAccountdata, getTransactionHistory } from "@/app/actions";
import type {
  AccountDetailsResponse,
  AccountType,
} from "@/types/AccountTyes";
import type { AccountTransaction } from "@/types/TransactionTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard as CreditCardIcon,
  HandCoins as LoanIcon,
  Landmark as LandmarkIcon,
  TrendingUp as InvestmentIcon,
  Users as FriendsIcon,
  Wallet as WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import CreateAccountModal from "./CreateAccountModal";
import { AccountTypeView } from "./AccountTypeViews";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import { getPeriodWindow } from "./periodBalance";
import PageHeader from "@/components/UI/PageHeader";

const TYPE_PRESENTATION: Record<
  AccountType,
  { title: string; description: string; icon: LucideIcon }
> = {
  BANK: {
    title: "Bank accounts",
    description: "Balances across your connected bank accounts.",
    icon: LandmarkIcon,
  },
  CREDIT_CARD: {
    title: "Credit cards",
    description: "Track your card balances and outstanding amounts.",
    icon: CreditCardIcon,
  },
  CASH: {
    title: "Cash accounts",
    description: "Keep track of cash you have on hand.",
    icon: WalletIcon,
  },
  LOAN: {
    title: "Loans",
    description: "Review your outstanding loans and repayments.",
    icon: LoanIcon,
  },
  INVESTMENT: {
    title: "Investments",
    description: "See the current value of your investments.",
    icon: InvestmentIcon,
  },
  FRIEND: {
    title: "Friends",
    description: "Track amounts you owe to friends or expect to receive.",
    icon: FriendsIcon,
  },
};

interface AccountTypeDashboardProps {
  type: AccountType;
}

export default function AccountTypeDashboard({ type }: AccountTypeDashboardProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { period, dailyRange } = useDashboardFilters();
  const { data: response, isPending, isError, error, refetch } =
    useQuery<AccountDetailsResponse>({
      queryKey: ["AccountSummary"],
      queryFn: getAccountdata,
    });
  const transactionQuery = useQuery<AccountTransaction[]>({
    queryKey: ["TransactionHistory"],
    queryFn: getTransactionHistory,
  });
  const periodWindow = getPeriodWindow(period, dailyRange);
  const presentation = TYPE_PRESENTATION[type];
  const Icon = presentation.icon;
  const accounts =
    response?.data?.accountDetailsList?.filter((account) => account.type === type) ?? [];
  const noAccounts =
    !!response?.error &&
    response.message?.toLowerCase().includes("no accounts found for user");
  const errorMessage = isError
    ? error?.message || "Failed to load account details"
    : response?.error && !noAccounts
      ? response.message || "Failed to load account details"
      : null;

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-3 text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-300 transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Overview
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <PageHeader
            title={presentation.title}
            actions={
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Add account
              </button>
            }
          />
        </div>
      </div>

      {isPending && (
        <p role="status" className="text-sm text-slate-400">
          Loading account details...
        </p>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {transactionQuery.isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-amber-400/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-200"
        >
          <span>Period comparisons could not be loaded.</span>
          <button
            type="button"
            onClick={() => void transactionQuery.refetch()}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {accounts.length > 0 ? (
        <AccountTypeView
          type={type}
          accounts={accounts}
          transactions={transactionQuery.data ?? []}
          periodWindow={periodWindow}
          comparisonLoading={transactionQuery.isPending}
          comparisonUnavailable={transactionQuery.isError}
        />
      ) : (
        !isPending &&
        !errorMessage && (
          <p className="rounded-xl border border-white/10 bg-[#0b1220] p-5 text-sm text-slate-400">
            No {presentation.title.toLowerCase()} have been added yet.
          </p>
        )
      )}

      <CreateAccountModal
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        initialType={type}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["AccountSummary"] });
        }}
      />
    </section>
  );
}

