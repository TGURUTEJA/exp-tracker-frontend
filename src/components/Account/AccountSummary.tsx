'use client';

import { getAccountdata, getTransactionHistory } from "@/app/actions";
import type {
  AccountDetails,
  AccountDetailsResponse,
  AccountType,
} from "@/types/AccountTyes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import CreateAccountModal from "./CreateAccountModal";
import Link from "next/link";
import type { AccountTransaction } from "@/types/TransactionTypes";
import { useDashboardFilters } from "@/context/DashboardFiltersContext";
import PeriodBalanceDetails from "./PeriodBalanceDetails";
import {
  getAccountTypeComparison,
  getPeriodWindow,
  type BalanceComparison,
} from "./periodBalance";

const ACCOUNT_TYPES: AccountType[] = [
  "BANK",
  "CREDIT_CARD",
  "CASH",
  "LOAN",
  "INVESTMENT",
  "FRIEND",
];
const ACCOUNT_TYPE_SET = new Set<string>(ACCOUNT_TYPES);

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: "Bank",
  CREDIT_CARD: "Credit Card",
  CASH: "Cash",
  LOAN: "Loan",
  INVESTMENT: "Investment",
  FRIEND: "Friends",
};
const ACCOUNT_TYPE_ADD_LABELS: Record<AccountType, string> = {
  BANK: "Add bank account",
  CREDIT_CARD: "Add credit card",
  CASH: "Add cash account",
  LOAN: "Add loan account",
  INVESTMENT: "Add investment account",
  FRIEND: "Add friend account",
};

export default function AccountSummary({ className = "" }: { className?: string }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createAccountType, setCreateAccountType] = useState<AccountType>();
  const queryClient = useQueryClient();
  const { period, dailyRange } = useDashboardFilters();
  const accountListRef = useRef<HTMLDivElement>(null);
  const [hasMoreAccounts, setHasMoreAccounts] = useState(false);
  const {
    data: response,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<AccountDetailsResponse>({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });
  const summary = response?.data?.accountSummary;
  const details = response?.data?.accountDetailsList ?? [];
  const transactionQuery = useQuery<AccountTransaction[]>({
    queryKey: ["TransactionHistory"],
    queryFn: getTransactionHistory,
  });
  const transactions = transactionQuery.data ?? [];
  const periodWindow = getPeriodWindow(period, dailyRange);
  const comparisonLoading = isPending || transactionQuery.isPending;
  const responseMessage = response?.message?.toLowerCase() ?? "";
  const noAccounts =
    !!response?.error && responseMessage.includes("no accounts found for user");
  const availableTypes = new Set(
    details
      .map((account) => account.type)
      .filter((type): type is AccountType => ACCOUNT_TYPE_SET.has(type))
  );
  const canShowAddAccount =
    !!response &&
    (!response.error || noAccounts) &&
    availableTypes.size < ACCOUNT_TYPES.length;
  const errorMessage = isError
    ? error?.message || "Failed to load account details"
    : response?.error && !noAccounts
      ? response.message || "Failed to load account details"
      : null;
  const comparisonUnavailable = Boolean(
    isError || errorMessage || transactionQuery.isError
  );

  useEffect(() => {
    const element = accountListRef.current;
    if (!element) return;

    const updateScrollHint = () => {
      const hasOverflow = element.scrollWidth > element.clientWidth + 8;
      const hasRemainingContent =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 8;
      setHasMoreAccounts(hasOverflow && hasRemainingContent);
    };

    updateScrollHint();
    element.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    return () => {
      element.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [details.length, canShowAddAccount]);

  const openCreateAccount = (type?: AccountType) => {
    setCreateAccountType(type);
    setCreateModalOpen(true);
  };

  return (
    <>
      <section
        className={`min-w-0 xl:h-full ${className}`}
        aria-label="Account summary"
      >
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

        <div className="relative min-w-0 xl:h-full">
            <div
              ref={accountListRef}
              aria-label="Account type balances"
              role="region"
              tabIndex={0}
              className="scrollbar-hide flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 xl:h-full"
            >
              {ACCOUNT_TYPES.filter((type) => availableTypes.has(type)).map(
                (type) => (
                  <div key={type} className="w-[180px] flex-shrink-0 snap-start xl:h-full">
                    <SummaryCard
                      title={ACCOUNT_TYPE_LABELS[type]}
                      value={getSummaryValue(type, summary, details)}
                      href={`/account/${type.toLowerCase()}`}
                      onAddAccount={() => openCreateAccount(type)}
                      addAccountLabel={ACCOUNT_TYPE_ADD_LABELS[type]}
                      comparison={
                        comparisonLoading || comparisonUnavailable
                          ? null
                          : getAccountTypeComparison(
                              type,
                              details,
                              transactions,
                              periodWindow
                            )
                      }
                      periodLabel={periodWindow.label}
                      comparisonLoading={comparisonLoading}
                      comparisonUnavailable={comparisonUnavailable}
                    />
                  </div>
                )
              )}

              {canShowAddAccount && (
                <button
                  type="button"
                  onClick={() => openCreateAccount()}
                  className="flex min-h-[212px] w-[180px] flex-shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-400/40 bg-gradient-to-br from-[#0b1220] to-[#020617] p-3 text-slate-300 transition hover:border-yellow-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-400/40 text-yellow-400">
                    <Plus size={20} />
                  </span>
                  <span className="text-center text-sm font-medium">Add an account</span>
                </button>
              )}
            </div>
          {hasMoreAccounts && (
            <button
              type="button"
              aria-label="Scroll to more account types"
              title="Scroll to more account types"
              onClick={() =>
                accountListRef.current?.scrollBy({
                  left: 190,
                  behavior: "smooth",
                })
              }
              className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-slate-200 shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {(isPending || errorMessage) && (
          <div
            className={`mt-3 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
              errorMessage
                ? "border-red-500/30 bg-red-950/30 text-red-300"
                : "border-white/10 bg-[#0b1220] text-slate-300"
            }`}
            role={errorMessage ? "alert" : "status"}
          >
            <span>{errorMessage || "Loading account details..."}</span>
            {errorMessage && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="shrink-0 font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </section>

      <CreateAccountModal
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        initialType={createAccountType}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["AccountSummary"] });
        }}
      />
    </>
  );
}

type AccountSummaryValues = NonNullable<
  NonNullable<AccountDetailsResponse["data"]>["accountSummary"]
>;

function getSummaryValue(
  type: AccountType,
  summary: AccountSummaryValues | null | undefined,
  accounts: AccountDetails[]
): number | null {
  if (accounts.length > 0) {
    return accounts
      .filter((account) => account.type === type)
      .reduce(
        (total, account) => total + getAccountTypeValue(account, type),
        0
      );
  }

  if (!summary) return null;

  let value: number | null | undefined;
  switch (type) {
    case "BANK":
      value = summary.totalBankBalance;
      break;
    case "CREDIT_CARD":
      value = summary.totalCreditCardBalance;
      break;
    case "CASH":
      value = summary.totalCash;
      break;
    case "LOAN":
      value = summary.totalLoans;
      break;
    case "INVESTMENT":
      value = summary.totalInvestments;
      break;
    case "FRIEND":
      value = (summary.totalFriendCredits ?? 0) - (summary.totalFriendDebits ?? 0);
      break;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getAccountTypeValue(account: AccountDetails, type: AccountType) {
  if (type === "CREDIT_CARD") {
    return finiteAmount(
      account.additionalData?.creditCard?.outstanding ?? account.balance
    );
  }
  if (type === "INVESTMENT") {
    return finiteAmount(
      account.additionalData?.investment?.currentValue ?? account.balance
    );
  }
  return finiteAmount(account.balance);
}

function finiteAmount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type SummaryCardProps = {
  title: string;
  value: number | null;
  comparison?: BalanceComparison | null;
  periodLabel?: string;
  comparisonLoading?: boolean;
  comparisonUnavailable?: boolean;
  href?: string;
  onAddAccount?: () => void;
  addAccountLabel?: string;
};

function SummaryCard({
  title,
  value,
  comparison = null,
  periodLabel = "Period",
  comparisonLoading = false,
  comparisonUnavailable = false,
  href,
  onAddAccount,
  addAccountLabel,
}: SummaryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !actionMenuRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const formattedValue =
    value !== null && Number.isFinite(value)
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      : "—";

  const content = (
    <div className="h-full min-h-[212px] min-w-0 rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-sm transition">
      <div
        className={`flex items-start justify-between gap-3 ${
          onAddAccount ? "pr-8" : ""
        }`}
      >
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-200">
            {title}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Close bal</p>
        </div>
        {href && (
          <ChevronRight
            aria-hidden="true"
            size={18}
            className="mt-1 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white"
          />
        )}
      </div>
      <p className="mt-2 text-xl font-bold leading-tight text-white">
        {formattedValue}
      </p>
      {value === null && (
        <p className="mt-1 text-[11px] text-slate-500">Balance unavailable</p>
      )}
      <PeriodBalanceDetails
        comparison={comparison}
        periodLabel={periodLabel}
        loading={comparisonLoading}
        unavailable={comparisonUnavailable}
        compact
      />
    </div>
  );

  return (
    <div className="relative h-full min-w-0">
      {href ? (
        <Link
          href={href}
          aria-label={
            value === null
              ? `View ${title} accounts, balance unavailable`
              : `View ${title} accounts, balance ${formattedValue}`
          }
          className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
        >
          {content}
        </Link>
      ) : (
        content
      )}

      {onAddAccount && (
        <div ref={actionMenuRef} className="absolute right-3 top-3 z-10">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={`More actions for ${title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 min-w-40 rounded-lg border border-white/10 bg-slate-800 p-1 shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                onClick={() => {
                  setMenuOpen(false);
                  onAddAccount();
                }}
              >
                {addAccountLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}