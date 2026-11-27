'use client';

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, X } from "lucide-react";
import { createAccount } from "@/app/actions";
import type { AccountType, CreateAccountPayload } from "@/types/AccountTyes";

interface CreateAccountModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  initialType?: AccountType;
}

interface AccountFormFields {
  balance: string;
  outstanding: string;
  creditLimit: string;
  dueDate: string;
  billDate: string;
  principalAmount: string;
  interestRate: string;
  totalInstallments: string;
  paidInstallments: string;
  emiAmount: string;
  startDate: string;
  endDate: string;
  nextDueDate: string;
  investmentType: string;
  purchaseDate: string;
  maturityDate: string;
  amountInvested: string;
  currentValue: string;
  expectedReturn: string;
  friendName: string;
  contactInfo: string;
  friendOutstanding: string;
  loanStartDate: string;
  loanDueDate: string;
}

const ACCOUNT_TYPES: AccountType[] = [
  "BANK",
  "CREDIT_CARD",
  "CASH",
  "LOAN",
  "INVESTMENT",
  "FRIEND",
];

const emptyFields = (): AccountFormFields => ({
  balance: "0",
  outstanding: "0",
  creditLimit: "",
  dueDate: "",
  billDate: "",
  principalAmount: "",
  interestRate: "",
  totalInstallments: "",
  paidInstallments: "0",
  emiAmount: "",
  startDate: "",
  endDate: "",
  nextDueDate: "",
  investmentType: "",
  purchaseDate: "",
  maturityDate: "",
  amountInvested: "",
  currentValue: "",
  expectedReturn: "",
  friendName: "",
  contactInfo: "",
  friendOutstanding: "0",
  loanStartDate: "",
  loanDueDate: "",
});

export default function CreateAccountModal({
  open,
  setOpen,
  onSuccess,
  initialType,
}: CreateAccountModalProps) {
  const [type, setType] = useState<AccountType>(initialType ?? "BANK");
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [fields, setFields] = useState<AccountFormFields>(emptyFields);
  const [friendDirection, setFriendDirection] = useState<"OWED_TO_ME" | "I_OWE">("OWED_TO_ME");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (open) {
      setType(initialType ?? "BANK");
      setDisplayName("");
      setCurrency("INR");
      setFields(emptyFields());
      setFriendDirection("OWED_TO_ME");
      setErrorMessage(null);
    }
  }, [open, initialType]);

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!loadingRef.current) setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "input, select, button, a[href], [tabindex]"
        ) ?? []
      ).filter((element) => !element.matches(":disabled") && element.tabIndex >= 0);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const focusIsOutside =
        !dialogRef.current?.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || focusIsOutside)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          "input:not(:disabled), select:not(:disabled), button:not(:disabled)"
        )
        ?.focus();
    });

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, setOpen]);

  if (!open) return null;

  const updateField = (field: keyof AccountFormFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const optionalDate = (value: string) => value || undefined;
  const numeric = (value: string) => Number(value);

  const buildPayload = (): CreateAccountPayload => {
    const common = {
      displayName: displayName.trim(),
      currency: currency.trim().toUpperCase(),
    };

    switch (type) {
      case "BANK":
      case "CASH":
        return { ...common, type, balance: numeric(fields.balance) };
      case "CREDIT_CARD":
        return {
          ...common,
          type,
          balance: numeric(fields.outstanding),
          additionalData: {
            creditCard: {
              outstanding: numeric(fields.outstanding),
              creditLimit: numeric(fields.creditLimit),
              dueDate: optionalDate(fields.dueDate),
              billDate: optionalDate(fields.billDate),
            },
          },
        };
      case "LOAN":
        return {
          ...common,
          type,
          balance: numeric(fields.balance),
          additionalData: {
            emi: {
              principalAmount: numeric(fields.principalAmount),
              interestRate: numeric(fields.interestRate),
              totalInstallments: numeric(fields.totalInstallments),
              paidInstallments: numeric(fields.paidInstallments),
              emiAmount: numeric(fields.emiAmount),
              startDate: fields.startDate,
              endDate: optionalDate(fields.endDate),
              nextDueDate: optionalDate(fields.nextDueDate),
            },
          },
        };
      case "INVESTMENT":
        return {
          ...common,
          type,
          balance: numeric(fields.currentValue),
          additionalData: {
            investment: {
              investmentType: fields.investmentType.trim(),
              purchaseDate: fields.purchaseDate,
              maturityDate: optionalDate(fields.maturityDate),
              amountInvested: numeric(fields.amountInvested),
              expectedReturn: fields.expectedReturn
                ? numeric(fields.expectedReturn)
                : undefined,
              currentValue: numeric(fields.currentValue),
            },
          },
        };
      case "FRIEND": {
        const amount = numeric(fields.friendOutstanding);
        return {
          ...common,
          type,
          balance: friendDirection === "I_OWE" ? -amount : amount,
          additionalData: {
            friend: {
              friendName: fields.friendName.trim(),
              contactInfo: fields.contactInfo.trim() || undefined,
              outstandingAmount: amount,
              loanStartDate: optionalDate(fields.loanStartDate),
              loanDueDate: optionalDate(fields.loanDueDate),
            },
          },
        };
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      type === "LOAN" &&
      Number(fields.paidInstallments) > Number(fields.totalInstallments)
    ) {
      setErrorMessage("Paid installments cannot exceed total installments.");
      return;
    }
    if (
      type === "LOAN" &&
      fields.endDate &&
      fields.endDate < fields.startDate
    ) {
      setErrorMessage("The loan end date must be on or after the start date.");
      return;
    }
    if (
      type === "INVESTMENT" &&
      fields.maturityDate &&
      fields.maturityDate < fields.purchaseDate
    ) {
      setErrorMessage("The maturity date must be on or after the purchase date.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await createAccount(buildPayload());

      if (response.error) {
        setErrorMessage(response.message || "Failed to create account");
        return;
      }

      setOpen(false);
      onSuccess();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  const accountTypeLabel = type.replace("_", " ").toLowerCase();

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!loadingRef.current) setOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
        aria-busy={loading}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          disabled={loading}
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setOpen(false)}
        >
          <X size={22} />
        </button>

        <h2
          id="create-account-title"
          className="mb-6 border-b border-slate-700 pb-3 pr-8 text-xl font-bold text-white"
        >
          Add {initialType ? `${accountTypeLabel} account` : "account"}
        </h2>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={loading} className="min-w-0 space-y-4 border-0 p-0">
          {initialType ? (
            <p className="text-sm text-slate-300">
              Account type: <span className="font-semibold text-white">{type.replace("_", " ")}</span>
            </p>
          ) : (
            <label className="flex flex-col text-sm text-slate-300">
              Account type
              <select
                required
                value={type}
                onChange={(event) => setType(event.target.value as AccountType)}
                className="mt-1 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
              >
                {ACCOUNT_TYPES.map((accountType) => (
                  <option key={accountType} value={accountType}>
                    {accountType.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          <FormField
            label="Account name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g., Main bank account"
            maxLength={50}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {type === "BANK" || type === "CASH" ? (
              <FormField
                label={type === "BANK" ? "Current balance" : "Cash balance"}
                value={fields.balance}
                onChange={(value) => updateField("balance", value)}
                type="number"
                min={0}
                step="0.01"
              />
            ) : null}

            {type === "CREDIT_CARD" && (
              <>
                <FormField
                  label="Outstanding balance"
                  value={fields.outstanding}
                  onChange={(value) => updateField("outstanding", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Credit limit"
                  value={fields.creditLimit}
                  onChange={(value) => updateField("creditLimit", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Due date"
                  value={fields.dueDate}
                  onChange={(value) => updateField("dueDate", value)}
                  type="date"
                  required={false}
                />
                <FormField
                  label="Bill date"
                  value={fields.billDate}
                  onChange={(value) => updateField("billDate", value)}
                  type="date"
                  required={false}
                />
              </>
            )}

            {type === "LOAN" && (
              <>
                <FormField
                  label="Current outstanding balance"
                  value={fields.balance}
                  onChange={(value) => updateField("balance", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Original principal"
                  value={fields.principalAmount}
                  onChange={(value) => updateField("principalAmount", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Annual interest rate (%)"
                  value={fields.interestRate}
                  onChange={(value) => updateField("interestRate", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="EMI amount"
                  value={fields.emiAmount}
                  onChange={(value) => updateField("emiAmount", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Total installments"
                  value={fields.totalInstallments}
                  onChange={(value) => updateField("totalInstallments", value)}
                  type="number"
                  min={1}
                  step="1"
                />
                <FormField
                  label="Paid installments"
                  value={fields.paidInstallments}
                  onChange={(value) => updateField("paidInstallments", value)}
                  type="number"
                  min={0}
                  step="1"
                />
                <FormField
                  label="Loan start date"
                  value={fields.startDate}
                  onChange={(value) => updateField("startDate", value)}
                  type="date"
                />
                <FormField
                  label="Loan end date"
                  value={fields.endDate}
                  onChange={(value) => updateField("endDate", value)}
                  type="date"
                  required={false}
                />
                <FormField
                  label="Next payment due"
                  value={fields.nextDueDate}
                  onChange={(value) => updateField("nextDueDate", value)}
                  type="date"
                  required={false}
                />
              </>
            )}

            {type === "INVESTMENT" && (
              <>
                <FormField
                  label="Investment type"
                  value={fields.investmentType}
                  onChange={(value) => updateField("investmentType", value)}
                  placeholder="e.g., Mutual fund"
                  maxLength={50}
                />
                <FormField
                  label="Purchase date"
                  value={fields.purchaseDate}
                  onChange={(value) => updateField("purchaseDate", value)}
                  type="date"
                />
                <FormField
                  label="Amount invested"
                  value={fields.amountInvested}
                  onChange={(value) => updateField("amountInvested", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Current value"
                  value={fields.currentValue}
                  onChange={(value) => updateField("currentValue", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Expected return"
                  value={fields.expectedReturn}
                  onChange={(value) => updateField("expectedReturn", value)}
                  type="number"
                  min={0}
                  step="0.01"
                  required={false}
                />
                <FormField
                  label="Maturity date"
                  value={fields.maturityDate}
                  onChange={(value) => updateField("maturityDate", value)}
                  type="date"
                  required={false}
                />
              </>
            )}

            {type === "FRIEND" && (
              <>
                <FormField
                  label="Friend's name"
                  value={fields.friendName}
                  onChange={(value) => updateField("friendName", value)}
                  maxLength={100}
                />
                <FormField
                  label="Contact info"
                  value={fields.contactInfo}
                  onChange={(value) => updateField("contactInfo", value)}
                  required={false}
                  maxLength={255}
                />
                <label className="flex flex-col text-sm text-slate-300">
                  Balance direction
                  <select
                    value={friendDirection}
                    onChange={(event) =>
                      setFriendDirection(event.target.value as "OWED_TO_ME" | "I_OWE")
                    }
                    className="mt-1 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="OWED_TO_ME">They owe me</option>
                    <option value="I_OWE">I owe them</option>
                  </select>
                </label>
                <FormField
                  label="Outstanding amount"
                  value={fields.friendOutstanding}
                  onChange={(value) => updateField("friendOutstanding", value)}
                  type="number"
                  min={0}
                  step="0.01"
                />
                <FormField
                  label="Loan start date"
                  value={fields.loanStartDate}
                  onChange={(value) => updateField("loanStartDate", value)}
                  type="date"
                  required={false}
                />
                <FormField
                  label="Due date"
                  value={fields.loanDueDate}
                  onChange={(value) => updateField("loanDueDate", value)}
                  type="date"
                  required={false}
                />
              </>
            )}

            <FormField
              label="Currency"
              value={currency}
              onChange={setCurrency}
              placeholder="e.g., INR"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 py-2.5 font-semibold text-slate-900 transition hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 disabled:cursor-wait disabled:bg-slate-600 disabled:text-slate-400"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
  required?: boolean;
  min?: number;
  step?: string;
  maxLength?: number;
  placeholder?: string;
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  min,
  step,
  maxLength,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="flex flex-col text-sm text-slate-300">
      {label}
      <input
        required={required}
        type={type}
        min={min}
        step={step}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-400 focus:border-yellow-400 focus:outline-none"
      />
    </label>
  );
}
