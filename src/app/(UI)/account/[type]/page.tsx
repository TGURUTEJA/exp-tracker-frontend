import AccountTypeDashboard from "@/components/Account/AccountTypeDashboard";
import type { AccountType } from "@/types/AccountTyes";
import { notFound } from "next/navigation";

const ACCOUNT_TYPES: AccountType[] = [
  "BANK",
  "CREDIT_CARD",
  "CASH",
  "LOAN",
  "INVESTMENT",
  "FRIEND",
];

export default async function AccountTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const type = ACCOUNT_TYPES.find(
    (accountType) => accountType.toLowerCase() === slug.toLowerCase()
  );

  if (!type) {
    notFound();
  }

  return <AccountTypeDashboard type={type} />;
}
