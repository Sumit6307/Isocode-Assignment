"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  CalendarCheck,
  BookOpen,
  Clock,
  Building2,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser = {
    name: "Rajesh Mehta",
    email: "admin@company-a.com",
    role: "ADMIN",
  },
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Analytics & Sources",
      href: "/dashboard",
      icon: BarChart3,
      badge: "Live",
    },
    {
      label: "Lead Desk & Dedup",
      href: "/dashboard/leads",
      icon: Users,
    },
    {
      label: "Site Visits & Calendar",
      href: "/dashboard/visits",
      icon: CalendarCheck,
    },
    {
      label: "Fact Sheet Editor",
      href: "/dashboard/admin/fact-sheet",
      icon: BookOpen,
      adminOnly: true,
    },
    {
      label: "Slot Capacity Manager",
      href: "/dashboard/admin/slots",
      icon: Clock,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 min-h-screen border-r border-stone-800">
      {/* Brand header */}
      <div className="p-5 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              COMPANY A
            </h1>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
              Sales & Lead Desk
            </p>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Core Workspaces
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-teal-700/30 text-teal-300 border-l-2 border-teal-500 font-semibold"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-teal-400" : "text-stone-400"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded font-mono font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Public Interfaces
        </div>

        <Link
          href="/chat"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-stone-400" />
            <span>Buyer AI Chat</span>
          </div>
          <span className="text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">
            Tab
          </span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-stone-400" />
            <span>Developer Website</span>
          </div>
        </Link>
      </div>

      {/* User profile & demo credentials */}
      <div className="p-3.5 border-t border-stone-800 bg-stone-950/40">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-teal-400 font-semibold text-xs">
            {currentUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-stone-400 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ROLE: {currentUser.role}
          </span>
          <Link
            href="/login"
            className="text-stone-400 hover:text-white flex items-center gap-1 text-[11px]"
          >
            <LogOut className="w-3 h-3" /> Switch
          </Link>
        </div>
      </div>
    </aside>
  );
};
