import type { AccountDetails, AccountType } from "@/types/AccountTyes";
import type { AccountTransaction } from "@/types/TransactionTypes";
import type { BalanceComparison, PeriodWindow } from "./periodBalance";
import {
  getAccountPeriodComparison,
  getAccountTypeComparison,
} from "./periodBalance";
import PeriodBalanceDetails from "./PeriodBalanceDetails";
import {
  Banknote,
  CreditCard,
  HandCoins,
  Landmark,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export function AccountTypeView({
  type,
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: {
  type: AccountType;
  accounts: AccountDetails[];
  transactions: AccountTransaction[];
  periodWindow: PeriodWindow;
  comparisonLoading: boolean;
  comparisonUnavailable: boolean;
}) {
  const props = {
    accounts,
    transactions,
    periodWindow,
    comparisonLoading,
    comparisonUnavailable,
  };

  switch (type) {
    case "BANK":
      return <BankDashboard {...props} />;
    case "CASH":
      return <CashDashboard {...props} />;
    case "CREDIT_CARD":
      return <CreditCardDashboard {...props} />;
    case "LOAN":
      return <LoanDashboard {...props} />;
    case "INVESTMENT":
      return <InvestmentDashboard {...props} />;
    case "FRIEND":
      return <FriendDashboard {...props} />;
  }
}

interface AccountDashboardProps {
  accounts: AccountDetails[];
  transactions: AccountTransaction[];
  periodWindow: PeriodWindow;
  comparisonLoading: boolean;
  comparisonUnavailable: boolean;
}

export function getAccountBalance(account: AccountDetails, type: AccountType) {
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

export function formatCurrency(value: number, currency = "INR") {
  const formattedValue = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finiteAmount(value));

  return currency === "INR" ? `₹${formattedValue}` : `${currency} ${formattedValue}`;
}

function finiteAmount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function BankDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const total = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, "BANK"),
    0
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.5fr)]">
      <MetricPanel
        label="Total bank balance"
        value={total}
        comparison={getPageComparison(
          "BANK",
          accounts,
          transactions,
          periodWindow,
          comparisonLoading,
          comparisonUnavailable
        )}
        periodLabel={periodWindow.label}
        comparisonLoading={comparisonLoading}
        comparisonUnavailable={comparisonUnavailable}
      >
        Across {accounts.length} bank {accounts.length === 1 ? "account" : "accounts"}
      </MetricPanel>
      <section className="space-y-3" aria-label="Bank account balances">
        {accounts.map((account) => (
          <article
            key={account.id}
            className="space-y-4 rounded-xl border border-white/10 bg-[#0b1220] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Landmark className="text-blue-300" size={20} />
                <div>
                  <h2 className="font-semibold">{account.displayName}</h2>
                  <p className="text-xs uppercase text-slate-500">{account.status}</p>
                </div>
              </div>
              <strong className="text-lg text-blue-200">
                {formatCurrency(account.balance, account.currency)}
              </strong>
            </div>
            <AccountPeriodDetails
              account={account}
              transactions={transactions}
              periodWindow={periodWindow}
              loading={comparisonLoading}
              unavailable={comparisonUnavailable}
            />
          </article>
        ))}
      </section>
    </div>
  );
}

function CashDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const total = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, "CASH"),
    0
  );

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-950 to-[#0b1220] p-7">
        <Wallet size={28} className="mb-5 text-emerald-300" />
        <p className="text-sm text-emerald-100/70">Cash on hand</p>
        <p className="mt-2 text-4xl font-bold text-emerald-200">{formatCurrency(total)}</p>
        <p className="mt-3 text-sm text-slate-400">
          {accounts.length} cash {accounts.length === 1 ? "wallet" : "wallets"} tracked
        </p>
        <PeriodBalanceDetails
          comparison={
            getPageComparison(
              "CASH",
              accounts,
              transactions,
              periodWindow,
              comparisonLoading,
              comparisonUnavailable
            )
          }
          periodLabel={periodWindow.label}
          loading={comparisonLoading}
          unavailable={comparisonUnavailable}
        />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Cash wallets">
        {accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-2xl border border-emerald-300/10 bg-[#0b1220] p-5"
          >
            <div className="flex items-center gap-2 text-emerald-300">
              <Banknote size={18} />
              <span className="text-xs uppercase tracking-wider">{account.status}</span>
            </div>
            <h2 className="mt-4 font-semibold">{account.displayName}</h2>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(account.balance, account.currency)}
            </p>
            <AccountPeriodDetails
              account={account}
              transactions={transactions}
              periodWindow={periodWindow}
              loading={comparisonLoading}
              unavailable={comparisonUnavailable}
            />
          </article>
        ))}
      </section>
    </div>
  );
}

function CreditCardDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const total = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, "CREDIT_CARD"),
    0
  );
  const totalLimit = accounts.reduce(
    (sum, account) =>
      sum + finiteAmount(account.additionalData?.creditCard?.creditLimit),
    0
  );
  const availableCredit = Math.max(totalLimit - total, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricPanel
          label="Total outstanding"
          value={total}
          accent="rose"
          comparison={getPageComparison(
            "CREDIT_CARD",
            accounts,
            transactions,
            periodWindow,
            comparisonLoading,
            comparisonUnavailable
          )}
          periodLabel={periodWindow.label}
          comparisonLoading={comparisonLoading}
          comparisonUnavailable={comparisonUnavailable}
          higherIsBetter={false}
        />
        <MetricPanel label="Total credit limit" value={totalLimit} />
        <MetricPanel label="Available credit" value={availableCredit} accent="emerald" />
      </div>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Credit cards">
        {accounts.map((account) => {
          const card = account.additionalData?.creditCard;
          const limit = finiteAmount(card?.creditLimit);
          const outstanding = finiteAmount(card?.outstanding ?? account.balance);
          const utilization =
            limit > 0
              ? Math.min(Math.max((outstanding / limit) * 100, 0), 100)
              : 0;

          return (
            <article
              key={account.id}
              className="overflow-hidden rounded-2xl border border-rose-300/15 bg-gradient-to-br from-[#3b1725] via-[#111827] to-[#0b1220] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-rose-200/70">
                    Credit card
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">{account.displayName}</h2>
                </div>
                <CreditCard className="text-rose-200" size={24} />
              </div>
              <p className="mt-6 text-xs text-slate-400">Outstanding</p>
              <p className="text-2xl font-bold text-rose-100">
                {formatCurrency(outstanding, account.currency)}
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Credit used</span>
                  <span>{utilization.toFixed(0)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                <Detail label="Limit" value={formatCurrency(limit, account.currency)} />
                <Detail label="Due date" value={card?.dueDate || "Not set"} />
                <Detail label="Bill date" value={card?.billDate || "Not set"} />
                <Detail label="Status" value={account.status} />
              </dl>
              <AccountPeriodDetails
                account={account}
                transactions={transactions}
                periodWindow={periodWindow}
                loading={comparisonLoading}
                unavailable={comparisonUnavailable}
                higherIsBetter={false}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function LoanDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const total = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, "LOAN"),
    0
  );

  return (
    <div className="space-y-4">
      <MetricPanel
        label="Outstanding loan balance"
        value={total}
        accent="amber"
        comparison={getPageComparison(
          "LOAN",
          accounts,
          transactions,
          periodWindow,
          comparisonLoading,
          comparisonUnavailable
        )}
        periodLabel={periodWindow.label}
        comparisonLoading={comparisonLoading}
        comparisonUnavailable={comparisonUnavailable}
        higherIsBetter={false}
      >
        Current balance across your loans
      </MetricPanel>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Loan repayment plans">
        {accounts.map((account) => {
          const loan = account.additionalData?.emi;
          const installmentCount = Math.max(
            finiteAmount(loan?.totalInstallments),
            0
          );
          const paidCount = Math.min(
            Math.max(finiteAmount(loan?.paidInstallments), 0),
            installmentCount
          );
          const progress =
            installmentCount > 0
              ? (paidCount / installmentCount) * 100
              : 0;

          return (
            <article
              key={account.id}
              className="rounded-2xl border border-amber-300/15 bg-[#0b1220] p-5"
            >
              <div className="flex items-center gap-3">
                <HandCoins className="text-amber-300" size={22} />
                <div>
                  <h2 className="font-semibold">{account.displayName}</h2>
                  <p className="text-xs uppercase text-slate-500">{account.status}</p>
                </div>
              </div>
              <p className="mt-5 text-xs text-slate-400">Current balance</p>
              <p className="text-2xl font-bold text-amber-200">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Detail
                  label="Original principal"
                  value={formatCurrency(loan?.principalAmount ?? 0, account.currency)}
                />
                <Detail label="Interest rate" value={`${loan?.interestRate ?? 0}%`} />
                <Detail
                  label="Monthly EMI"
                  value={formatCurrency(loan?.emiAmount ?? 0, account.currency)}
                />
                <Detail label="Next due" value={loan?.nextDueDate || "Not set"} />
              </dl>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Installments paid</span>
                  <span>
                    {paidCount} / {installmentCount}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {loan?.startDate ? `Started ${loan.startDate}` : "Start date not available"}
                {loan?.endDate ? ` · Ends ${loan.endDate}` : ""}
              </p>
              <AccountPeriodDetails
                account={account}
                transactions={transactions}
                periodWindow={periodWindow}
                loading={comparisonLoading}
                unavailable={comparisonUnavailable}
                higherIsBetter={false}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function InvestmentDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const total = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, "INVESTMENT"),
    0
  );
  const invested = accounts.reduce(
    (sum, account) => sum + (account.additionalData?.investment?.amountInvested ?? 0),
    0
  );
  const gainLoss = total - invested;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricPanel
          label="Portfolio value"
          value={total}
          accent="violet"
          comparison={getPageComparison(
            "INVESTMENT",
            accounts,
            transactions,
            periodWindow,
            comparisonLoading,
            comparisonUnavailable
          )}
          periodLabel={periodWindow.label}
          comparisonLoading={comparisonLoading}
          comparisonUnavailable={comparisonUnavailable}
        />
        <MetricPanel label="Amount invested" value={invested} />
        <section className="rounded-2xl border border-violet-300/15 bg-[#0b1220] p-5">
          <p className="text-sm text-slate-400">Unrealized gain / loss</p>
          <p className={`mt-2 text-2xl font-bold ${gainLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {gainLoss >= 0 ? "+" : ""}
            {formatCurrency(gainLoss)}
          </p>
        </section>
      </div>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Investment portfolio">
        {accounts.map((account) => {
          const investment = account.additionalData?.investment;
          const currentValue = finiteAmount(
            investment?.currentValue ?? account.balance
          );
          const amountInvested = finiteAmount(investment?.amountInvested);
          const returnValue = currentValue - amountInvested;

          return (
            <article
              key={account.id}
              className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-950/60 to-[#0b1220] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-violet-200/70">
                    {investment?.investmentType || "Investment"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">{account.displayName}</h2>
                </div>
                <TrendingUp className="text-violet-200" size={22} />
              </div>
              <p className="mt-5 text-xs text-slate-400">Current value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(currentValue, account.currency)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                <Detail
                  label="Invested"
                  value={formatCurrency(amountInvested, account.currency)}
                />
                <Detail
                  label="Gain / loss"
                  value={`${returnValue >= 0 ? "+" : ""}${formatCurrency(returnValue, account.currency)}`}
                />
                <Detail label="Purchased" value={investment?.purchaseDate || "Not set"} />
                <Detail label="Maturity" value={investment?.maturityDate || "Not set"} />
                <Detail
                  label="Expected return"
                  value={
                    investment?.expectedReturn !== undefined &&
                    investment.expectedReturn !== null
                      ? formatCurrency(investment.expectedReturn, account.currency)
                      : "Not set"
                  }
                />
              </dl>
              <AccountPeriodDetails
                account={account}
                transactions={transactions}
                periodWindow={periodWindow}
                loading={comparisonLoading}
                unavailable={comparisonUnavailable}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function FriendDashboard({
  accounts,
  transactions,
  periodWindow,
  comparisonLoading,
  comparisonUnavailable,
}: AccountDashboardProps) {
  const receivable = accounts.reduce(
    (sum, account) => sum + Math.max(getAccountBalance(account, "FRIEND"), 0),
    0
  );
  const payable = accounts.reduce(
    (sum, account) => sum + Math.max(-getAccountBalance(account, "FRIEND"), 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricPanel label="Owed to you" value={receivable} accent="emerald" />
        <MetricPanel label="You owe" value={payable} accent="rose" />
        <MetricPanel
          label="Net balance"
          value={receivable - payable}
          accent="blue"
          comparison={getPageComparison(
            "FRIEND",
            accounts,
            transactions,
            periodWindow,
            comparisonLoading,
            comparisonUnavailable
          )}
          periodLabel={periodWindow.label}
          comparisonLoading={comparisonLoading}
          comparisonUnavailable={comparisonUnavailable}
        />
      </div>
      <section className="space-y-3" aria-label="Friend balances">
        {accounts.map((account) => {
          const friend = account.additionalData?.friend;
          const balance = getAccountBalance(account, "FRIEND");
          const isReceivable = balance >= 0;

          return (
            <article
              key={account.id}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#0b1220] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full p-3 ${isReceivable ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                    <Users size={20} />
                  </span>
                  <div>
                    <h2 className="font-semibold">{friend?.friendName || account.displayName}</h2>
                    <p className="text-sm text-slate-400">
                      {friend?.contactInfo || account.displayName}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">
                    {isReceivable ? "They owe you" : "You owe them"}
                  </p>
                  <p className={`text-xl font-bold ${isReceivable ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatCurrency(Math.abs(balance), account.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {friend?.loanDueDate ? `Due ${friend.loanDueDate}` : account.status}
                  </p>
                </div>
              </div>
              <AccountPeriodDetails
                account={account}
                transactions={transactions}
                periodWindow={periodWindow}
                loading={comparisonLoading}
                unavailable={comparisonUnavailable}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function MetricPanel({
  label,
  value,
  accent = "yellow",
  children,
  comparison,
  periodLabel = "Period",
  comparisonLoading = false,
  comparisonUnavailable = false,
  higherIsBetter = true,
}: {
  label: string;
  value: number;
  accent?: "yellow" | "blue" | "rose" | "emerald" | "amber" | "violet";
  children?: React.ReactNode;
  comparison?: BalanceComparison | null;
  periodLabel?: string;
  comparisonLoading?: boolean;
  comparisonUnavailable?: boolean;
  higherIsBetter?: boolean;
}) {
  const accentClasses = {
    yellow: "border-yellow-300/15 text-yellow-200",
    blue: "border-blue-300/15 text-blue-200",
    rose: "border-rose-300/15 text-rose-200",
    emerald: "border-emerald-300/15 text-emerald-200",
    amber: "border-amber-300/15 text-amber-200",
    violet: "border-violet-300/15 text-violet-200",
  };

  return (
    <section className={`rounded-2xl border bg-[#0b1220] p-5 ${accentClasses[accent]}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{formatCurrency(value)}</p>
      {children && <p className="mt-2 text-xs text-slate-500">{children}</p>}
      {comparison !== undefined && (
        <PeriodBalanceDetails
          comparison={comparison}
          periodLabel={periodLabel}
          loading={comparisonLoading}
          unavailable={comparisonUnavailable}
          higherIsBetter={higherIsBetter}
        />
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

function AccountPeriodDetails({
  account,
  transactions,
  periodWindow,
  loading,
  unavailable,
  higherIsBetter = true,
}: {
  account: AccountDetails;
  transactions: AccountTransaction[];
  periodWindow: PeriodWindow;
  loading: boolean;
  unavailable: boolean;
  higherIsBetter?: boolean;
}) {
  return (
    <PeriodBalanceDetails
      comparison={
        loading || unavailable
          ? null
          : getAccountPeriodComparison(account, transactions, periodWindow)
      }
      periodLabel={periodWindow.label}
      currency={account.currency}
      loading={loading}
      unavailable={unavailable}
      higherIsBetter={higherIsBetter}
    />
  );
}

function getPageComparison(
  type: AccountType,
  accounts: AccountDetails[],
  transactions: AccountTransaction[],
  periodWindow: PeriodWindow,
  loading: boolean,
  unavailable: boolean
): BalanceComparison | null {
  if (loading || unavailable) return null;
  return getAccountTypeComparison(type, accounts, transactions, periodWindow);
}
