"use client";

import React from "react";
import Link from "next/link";
import { Building2, MessageSquare, ShieldCheck, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <span className="text-base font-bold text-stone-900 tracking-tight">
                AAVKAR REALTY
              </span>
              <span className="block text-[10px] text-teal-700 font-medium uppercase tracking-wider">
                Premier Residential Developer • Ahmedabad
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <a href="#projects" className="hover:text-teal-800 transition-colors">
              Live Projects (420 Units)
            </a>
            <a href="#specifications" className="hover:text-teal-800 transition-colors">
              Pricing & Amenities
            </a>
            <a href="#rera" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> RERA Disclosures
            </a>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                CRM Portal
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                AI Booking Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

