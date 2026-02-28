'use client';

import { getAccountdata } from "@/app/actions";
import { AccountData, AccountDetails, AccountDetailsResponse } from "@/types/AccountTyes";
import { useQuery } from "@tanstack/react-query";

export default function AccountSummary() {
  const { data: response, isPending, isError } = useQuery<AccountDetailsResponse>({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });

  if (isPending) {
    return <div className="p-4 text-white">Loading...</div>;
  }
  if (isError || response == undefined || response.error) {
    return <div className="p-4 text-red-500">Failed to load</div>;
  }
  const data: AccountData | undefined = response.data;
  const summary = data.accountSummary;
  const accounts = data.accountDetailsList;
  // if(true){
  //   return <div>
  //     <div>{JSON.stringify(data)}</div>
  //     <br />
  //     <div>{JSON.stringify(summary)}</div>
  //     <br />
  //     <div>{JSON.stringify(accounts)}</div>
  //     </div>
  // }


  const bankAccounts = accounts.filter(a => a.type === "BANK");

  const creditCardAccounts = accounts.filter(
    a => a.additionalData?.creditCard
  );

  const investmentAccounts = accounts.filter(
    a => a.additionalData?.investment
  );

  const emiAccounts = accounts.filter(
    a => a.additionalData?.emi
  );

  const friendAccounts = accounts.filter(
    a => a.additionalData?.friend
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-black">

      {/* Net Worth */}
      <SummaryCard
        title="Net Worth"
        total={summary.netWorth}
        accounts={accounts}
      />

      <SummaryCard
        title="Bank"
        total={summary.totalBankBalance}
        accounts={bankAccounts}
      />

      <SummaryCard
        title="Credit Card"
        total={summary.totalCreditCardBalance}
        accounts={creditCardAccounts}
      />

      <SummaryCard
        title="Investment"
        total={summary.totalInvestments}
        accounts={investmentAccounts}
      />

    </div>
  );
}

interface CardProps {
  title: string;
  total: number;
  accounts: AccountDetails[];
}

function SummaryCard({ title, total, accounts }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow border p-4 flex flex-col gap-3">
      <h2 className="text-gray-800 text-xl font-semibold">{title}</h2>

      <p className="text-lg font-medium text-blue-600">
        Total : ₹{total.toFixed(2)}
      </p>

      <div className="flex flex-col gap-2">
        {accounts.length === 0 && (
          <p className="text-gray-500 text-sm">No accounts found</p>
        )}

        {accounts.map(a => (
          <div
            key={a.id}
            className="flex justify-between text-sm bg-gray-100 rounded px-3 py-1"
          >
            <span className="text-gray-700">
              {a.displayName}
            </span>

            <span className="font-medium text-gray-800">
              ₹{a.balance.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
