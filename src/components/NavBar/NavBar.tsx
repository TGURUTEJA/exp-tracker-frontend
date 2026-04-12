"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { LogoutUser } from "@/actions/AuthActions";
import { useState } from "react";
import { getUserData } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/store";
import UserModles from "../Models/UserModels";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownMap {
  [key: string]: string[];
}

const dropdowns: DropdownMap = {
  Expenses: ["Monthly", "Yearly", "Categories", "Graphs"],
  Add: ["Add Expense", "Add Income"],
  Settings: ["Profile", "Security", "Notification"],
};

const sidebarSpring = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.85 };
const flyoutTransition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

const NavBar = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getUserData(),
  });
  const links = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Expenses", href: "/expenses", icon: <FileText size={18} /> },
    { name: "Add", href: "/add", icon: <PlusCircle size={18} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href ?? "");
  };

  const handleLogout = async () => {
    try {
      await LogoutUser();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  let response: UserData = {
    id: null,
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
  };
  if (!isPending && !isError && data) {
    response = data.data;
  }

  return (
    <div className="relative z-20 flex h-screen shrink-0">
      <motion.aside
        initial={false}
        animate={{ width: open ? 224 : 80 }}
        transition={sidebarSpring}
        className="flex min-h-0 flex-col overflow-x-hidden overflow-y-auto border-r border-slate-700 bg-slate-800"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-700 px-2">
          {open ? (
            <motion.div
              className="flex w-full min-w-0 items-center justify-between gap-2 pl-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.04 }}
            >
              <span className="truncate text-sm font-semibold text-white">
                Expense Tracker
              </span>
              <button
                type="button"
                className="shrink-0 rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-700"
                onClick={() => setOpen(false)}
                aria-label="Collapse sidebar"
              >
                <X size={20} />
              </button>
            </motion.div>
          ) : (
            <div className="flex w-full justify-center">
              <button
                type="button"
                className="rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-700"
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
          className={`mx-2 mt-3 flex shrink-0 cursor-pointer items-center rounded-lg bg-slate-700 text-left transition-colors hover:bg-slate-600 ${
            open ? "gap-3 p-3" : "h-16 justify-center p-0"
          }`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-900 bg-slate-600 text-sm font-semibold text-white">
            A
          </div>
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
                <p className="text-xs text-slate-300">Hi,</p>
                <p className="truncate text-sm font-medium text-white">
                  {response.firstName || "—"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {links.map((link) => (
            <div
              key={link.name}
              className="relative"
              onMouseEnter={() => dropdowns[link.name] && setHoverItem(link.name)}
              onMouseLeave={() => setHoverItem(null)}
            >
              <Link
                href={link.href}
                onClick={() => open && setOpen(false)}
                className={`flex items-center gap-2 rounded-md py-2.5 text-sm transition-colors duration-150 ${
                  open ? "px-3" : "justify-center px-2"
                } ${
                  isActive(link.href)
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span className="flex shrink-0 items-center justify-center">{link.icon}</span>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width,margin] duration-200 ease-out ${
                    open ? "ml-0 max-w-[11rem] opacity-100" : "ml-0 max-w-0 opacity-0"
                  }`}
                >
                  {link.name}
                </span>
                {open && dropdowns[link.name] && (
                  <ChevronRight size={16} className="ml-auto shrink-0 opacity-60" />
                )}
              </Link>

              {/* Expanded: inline submenu */}
              <AnimatePresence initial={false}>
                {open && hoverItem === link.name && dropdowns[link.name] && (
                  <motion.div
                    key="inline"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-2 mt-1 space-y-0.5 border-l border-slate-600 py-1 pl-3"
                  >
                    <div className="space-y-0.5">
                      {dropdowns[link.name].map((sub) => (
                        <Link
                          key={sub}
                          href={`${link.href}/${sub.toLowerCase()}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-2 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-700"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed: flyout */}
              <AnimatePresence initial={false}>
                {!open && hoverItem === link.name && dropdowns[link.name] && (
                  <motion.div
                    key="flyout"
                    initial={{ opacity: 0, x: -8, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -6, scale: 0.98 }}
                    transition={flyoutTransition}
                    className="absolute left-full top-0 z-50 ml-2 w-44 rounded-xl border border-white/15 bg-slate-900/95 p-2 shadow-xl backdrop-blur-md"
                  >
                    {dropdowns[link.name].map((sub) => (
                      <Link
                        key={sub}
                        href={`${link.href}/${sub.toLowerCase()}`}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-white/10"
                      >
                        {sub}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-700 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 rounded-md py-2 text-slate-300 transition-colors hover:bg-slate-700 ${
              open ? "justify-start px-3" : "justify-center px-2"
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap text-sm transition-[opacity,max-width] duration-200 ease-out ${
                open ? "max-w-[8rem] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </motion.aside>

      <UserModles open={showProfile} setOpen={setShowProfile} />
    </div>
  );
};

export default NavBar;
