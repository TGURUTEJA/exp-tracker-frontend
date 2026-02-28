'use client';

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import Link from "next/link";
import { LogoutUser } from "@/actions/AuthActions";
import { useState } from "react";
import { getUserData } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/store";
import UserModles from "../Models/UserModels";

interface DropdownMap {
  [key: string]: string[];
}

const dropdowns: DropdownMap = {
  Expenses: ["Monthly", "Yearly", "Categories", "Graphs"],
  Add: ["Add Expense", "Add Income"],
  Settings: ["Profile", "Security", "Notification"]
};

const NavBar = () => {
   const {data,isPending,isError} =  useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => getUserData(),// disable automatic query on mount
  });
  const links = [
    { name: 'Home', href: '/', icon: <Home size={18} /> },
    { name: 'Expenses', href: '/expenses', icon: <FileText size={18} /> },
    { name: 'Add', href: '/add', icon: <PlusCircle size={18} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={18} /> },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href ?? '');
  };

  const handleLogout = async () => {
    try {
      await LogoutUser();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };
  let response : UserData = {
    id: null,
    firstName: '',
    lastName: '',
    dob: '',
    email: ''
  };
  if(!isPending && !isError){
      response = data.data;
  }
  console.log("User Data in NavBar:", response.firstName);
  return (
    <div className="fixed">
      {/* EXPANDED SIDEBAR */}
      {open && (
        <aside className="min-h-screen inset-0 flex animate-fadeIn">

          {/* Sidebar panel */}
          <div className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col justify-between animate-slideInLeft">

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
              <span className="font-semibold text-lg">Expense Tracker</span>
              <button className="p-2 hover:bg-slate-700 rounded-md" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Profile */}
            <div onClick={() => setShowProfile(true)} className="flex bg-slate-700 h-16 m-3 rounded-lg items-center gap-3 p-3">
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center border border-slate-900">A</div>
              <div>
                <h1 className="text-white text-sm">Hi,</h1>
                <h3 className="text-white  -mt-1">{response.firstName}</h3>
              </div>
            </div>

            {/* Navigation with DROPDOWN (OPEN MODE) */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => (
                <div key={link.name}
                onMouseEnter={() => dropdowns[link.name] && setHoverItem(link.name)}
                  onMouseLeave={() => setHoverItem(null)}
                  >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all relative
                      ${isActive(link.href) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700'}
                    `}
                  >
                    {link.icon}
                    <span>{link.name}</span>

                    {dropdowns[link.name] && (
                      <ChevronRight size={16} className="ml-auto opacity-60" />
                    )}
                  </Link>

                  {/* EXPANDED INLINE DROPDOWN */}
                  {hoverItem === link.name && dropdowns[link.name] && (
                    <div className="ml-6 mt-1 space-y-1 animate-fadeIn">
                      {dropdowns[link.name].map((sub) => (
                        <Link
                          key={sub}
                          href={`${link.href}/${sub.toLowerCase()}`}
                          className="block p-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-slate-700">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-700">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* COLLAPSED SIDEBAR */}
      {!open && (
        <aside className=" flex min-h-screen flex-col justify-between w-20 bg-slate-800 border-r border-slate-700">
          
          {/* Menu Button */}
          <div>
            <div className="h-16 flex items-center justify-center border-b border-slate-700">
              <button onClick={() => setOpen(true)} className="p-2 hover:bg-slate-700 rounded-md">
                <Menu size={20} />
              </button>
            </div>

            {/* Avatar */}
            <div onClick={() => setShowProfile(true)} className="mt-4 ml-2 mr-2 bg-slate-700 rounded-lg h-16 flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">A</div>
            </div>

            {/* Collapsed NAV + DROPDOWN POPUP */}
            <nav className="px-2 py-4 space-y-3 overflow-y-auto">
              {links.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => dropdowns[link.name] && setHoverItem(link.name)}
                  onMouseLeave={() => setHoverItem(null)}
                >
                  {/* Main icon */}
                  <Link
                    href={link.href}
                    className={`
                      flex items-center justify-center px-4 py-3 rounded-md
                      ${isActive(link.href) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700'}
                    `}
                  >
                    {link.icon}
                  </Link>

                  {/* GLASS POPUP DROPDOWN */}
                  {hoverItem === link.name && dropdowns[link.name] && (
                    <div className="
                      absolute left-20 top-0 z-50
                      w-44 p-3 rounded-xl
                      bg-white/10 backdrop-blur-xl border border-white/20
                      shadow-xl animate-fadeIn
                    ">
                      {dropdowns[link.name].map((sub) => (
                        <Link
                          key={sub}
                          href={`${link.href}/${sub.toLowerCase()}`}
                          className="block px-3 py-2 rounded-md hover:bg-white/20 text-slate-100 text-sm"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700 flex justify-center">
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-slate-700">
              <LogOut size={16} />
            </button>
          </div>

        </aside>
      )}
     <UserModles open={showProfile} setOpen={setShowProfile}/>
    </div>
  );
};

export default NavBar;
