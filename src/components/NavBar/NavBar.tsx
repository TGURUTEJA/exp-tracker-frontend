"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Tags,
  ReceiptText,
  Wallet,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { LogoutUser } from "@/actions/AuthActions";
import { useState } from "react";
import { getUserData } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { UserData, UserDetailsResponse } from "@/types/store";
import UserModles from "../Models/UserModels";
import { AnimatePresence, motion } from "framer-motion";

const sidebarSpring = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.85 };

const NavBar = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getUserData(),
  });
  const links = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Transactions", href: "/transactions", icon: <ReceiptText size={18} /> },
    { name: "Budgets", href: "/budgets", icon: <Wallet size={18} /> },
    { name: "Categories", href: "/categories", icon: <Tags size={18} /> },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname?.startsWith("/account/") === true;
    }
    return pathname?.startsWith(href ?? "");
  };

  const handleLogout = async () => {
    setLogoutError(false);
    setLogoutLoading(true);
    try {
      await LogoutUser();
      router.push("/login");
    } catch {
      setLogoutError(true);
      setOpen(true);
    } finally {
      setLogoutLoading(false);
    }
  };

  let response: UserData = {
    id: null,
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
  };
  if (!isPending && !isError && data && typeof data === "object" && "data" in data) {
    const userData = (data as UserDetailsResponse).data;
    if (userData) {
      response = userData;
    }
  }

  return (
    <div className="sticky top-0 z-20 flex h-screen h-dvh shrink-0 self-start">
      <motion.aside
        initial={false}
        animate={{ width: open ? 224 : 72 }}
        transition={sidebarSpring}
        className="flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto border-r border-slate-800 bg-slate-900"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-slate-800 px-3">
          {open ? (
            <motion.div
              className="flex w-full min-w-0 items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.04 }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
                <Wallet size={18} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                Expense Tracker
              </span>
              <button
                type="button"
                className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Collapse sidebar"
              >
                <X size={18} />
              </button>
            </motion.div>
          ) : (
            <div className="flex w-full justify-center">
              <button
                type="button"
                className="rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(true)}
                aria-label="Expand sidebar"
              >
                <Menu size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          aria-label="Open profile"
          className={`mx-2 mt-2 flex shrink-0 cursor-pointer items-center rounded-lg bg-slate-800 text-left transition-colors hover:bg-slate-700 ${
            open ? "gap-2.5 px-3 py-2" : "h-12 justify-center gap-0 px-0"
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-700 text-sm font-semibold text-white"
          >
            {(response.firstName || response.email || "U").trim().charAt(0).toUpperCase() || "U"}
          </span>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="profile-labels"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0 flex-1"
              >
                <p className="text-[11px] text-slate-400">Hi,</p>
                <p className="truncate text-sm font-medium text-white">
                  {response.firstName || "—"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => open && setOpen(false)}
              aria-label={!open ? link.name : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
              title={!open ? link.name : undefined}
              className={`relative flex items-center rounded-lg text-sm transition-colors duration-150 ${
                open ? "gap-2.5 px-3 py-2" : "justify-center gap-0 px-0 py-2"
              } ${
                isActive(link.href)
                  ? "bg-slate-800 text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-yellow-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex w-7 shrink-0 justify-center">{link.icon}</span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200 ease-out ${
                  open ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {link.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-800 p-2">
          {logoutError && (
            <p role="alert" className="mb-2 px-1 text-xs text-red-300">
              Could not log out. Please try again.
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            aria-label={logoutLoading ? "Logging out" : "Log out"}
            className={`flex w-full items-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white ${
              open ? "gap-2.5 px-3 py-2" : "justify-center gap-0 px-0 py-2"
            } disabled:cursor-wait disabled:opacity-60`}
          >
            <span className="flex w-7 shrink-0 justify-center">
              <LogOut size={16} />
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap text-sm transition-[opacity,max-width] duration-200 ease-out ${
                open ? "max-w-[8rem] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              {logoutLoading ? "Logging out…" : "Logout"}
            </span>
          </button>
        </div>
      </motion.aside>

      <UserModles open={showProfile} setOpen={setShowProfile} />
    </div>
  );
};

export default NavBar;
