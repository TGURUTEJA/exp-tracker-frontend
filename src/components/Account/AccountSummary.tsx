'use client';

import { getAccountdata } from "@/app/actions";
import { AccountData, AccountDetailsResponse } from "@/types/AccountTyes";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

export default function AccountSummary() {
  const { data: response, isPending, isError } = useQuery<AccountDetailsResponse>({
    queryKey: ["AccountSummary"],
    queryFn: getAccountdata,
  });

  if (isPending) {
    return <div className="p-8 text-white text-center">Loading...</div>;
  }

  if (isError || !response || response.error) {
    return <div className="p-8 text-red-500 text-center">Failed to load</div>;
  }

  const data: AccountData = response.data;
  const summary = data.accountSummary;

  return (
    <div className="min-w-0 pr-6">

      <div className="flex min-w-0 w-full gap-4">

        {/* 🔒 NET WORTH */}
        <div className="flex-shrink-0 w-[280px]">
          <SummaryCard
            title="Net Worth"
            current={summary.netWorth}
            start={summary.netWorth}
            isPrimary
          />
        </div>

        {/* 👉 SCROLL AREA */}
        <div className="relative flex-1 overflow-hidden">

          <div
            id="scrollContainer"
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory flex-nowrap px-1 pb-2"
          >
            {[
              { title: "Bank", value: summary.totalBankBalance },
              { title: "Credit Card", value: summary.totalCreditCardBalance },
              { title: "Investment", value: summary.totalInvestments },
              { title: "EMI", value: 10000 },
              { title: "Friends", value: 5000 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[250px] snap-start"
              >
                <SummaryCard
                  title={item.title}
                  current={item.value}
                  start={summary.netWorth}
                />
              </div>
            ))}
          </div>

          <ScrollIndicator />
        </div>

      </div>
    </div>
  );
}

type FieldType = "current" | "start" | "diff";

type SummaryCardProps = {
  title: string;
  current: number;
  start: number;
  isPrimary?: boolean;
};

function SummaryCard({ title, current, start, isPrimary = false }: SummaryCardProps) {
  const [mainField, setMainField] = useState<FieldType>("current");

  const diff = current - start;
  const isPositive = diff >= 0;
  const absDiff = Math.abs(diff);
  const percentage = start !== 0 ? ((diff / start) * 100).toFixed(2) : "0.00";

  const getOrder = (): FieldType[] => {
    if (mainField === "current") return ["start", "diff"];
    if (mainField === "diff") return ["start", "current"];
    return ["current", "diff"];
  };

  const order = getOrder();

  const getValue = (field: FieldType) => {
    if (field === "current") return current;
    if (field === "start") return start;
    return absDiff;
  };

  const colors = {
    current: "text-yellow-400",
    start: "text-blue-400",
    diff: isPositive ? "text-green-400" : "text-red-400",
  };

  return (
    <div
      className={`relative rounded-2xl p-4 transition ${
        isPrimary
          ? "bg-gradient-to-br from-[#0b1220] to-[#020617] border border-yellow-400/20 shadow-lg"
          : "bg-[#0b1220] border border-white/10 shadow-sm"
      }`}
    >

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <MoreHorizontal className="text-gray-400 cursor-pointer" />
      </div>

      <LayoutGroup>

        {/* MAIN */}
        <motion.div layout className="flex justify-between items-center mb-3">

          <motion.div layout>
            <p className="text-xs text-gray-500 capitalize">{mainField}</p>

            <motion.h1
              layout
              className={`text-xl font-bold ${colors[mainField]}`}
            >
              ₹{getValue(mainField).toFixed(2)}
            </motion.h1>
          </motion.div>

          <motion.div layout className="text-xs font-semibold">
            <span className={isPositive ? "text-green-400" : "text-red-400"}>
              {isPositive ? "↑" : "↓"} {percentage}%
            </span>
          </motion.div>
        </motion.div>

        {/* SUB */}
        <motion.div layout className="flex justify-between text-xs">

          {order.map((field) => (
            <motion.div
              key={field}
              layout
              onClick={() => setMainField(field)}
              className="cursor-pointer hover:opacity-80"
            >
              <p className="text-gray-500 capitalize">{field}</p>
              <p className={`font-semibold ${colors[field]}`}>
                ₹{getValue(field).toFixed(2)}
              </p>
            </motion.div>
          ))}

        </motion.div>

      </LayoutGroup>
    </div>
  );
}

function ScrollIndicator() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const el = document.getElementById("scrollContainer");

    const check = () => {
      if (!el) return;
      const end =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      setShow(!end);
    };

    el?.addEventListener("scroll", check);
    check();

    return () => el?.removeEventListener("scroll", check);
  }, []);

  if (!show) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-end bg-gradient-to-l from-[#020617] to-transparent pointer-events-none">
      <div className="pr-2 text-gray-400 animate-pulse text-lg">→</div>
    </div>
  );
}