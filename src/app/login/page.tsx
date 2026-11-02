"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ShieldCheck, UserCheck, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@company-a.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "ADMIN / SALES HEAD",
      name: "Rajesh Mehta",
      email: "admin@company-a.com",
      desc: "Full access to Source Analytics, Fact Sheet Editor & Slot Capacity Manager",
    },
    {
      role: "SALES EXECUTIVE",
      name: "Priya Sharma",
      email: "priya@company-a.com",
      desc: "Lead Desk, Assigned Inquiries, Chat Transcripts & Site Visit Follow-ups",
    },
    {
      role: "BUYER",
      name: "Hardik Patel",
      email: "buyer@example.com",
      desc: "Buyer account with booked site visit for Shubh Residency (3 BHK)",
    },
  ];

  const handleSelectRole = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate direct authenticated access for reviewers
    setTimeout(() => {
      setLoading(false);
      if (email.includes("buyer")) {
        router.push("/chat");
      } else {
        router.push("/dashboard");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5 text-teal-200" />
          </div>
          <span className="text-xl font-extrabold text-stone-900 tracking-tight">
            COMPANY A
          </span>
        </Link>
        <h2 className="text-xl font-bold text-stone-900">
          Sales & Reviewer Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Choose a pre-configured role below for one-click testing
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* One-Click Reviewer Role Cards */}
        <div className="mb-6 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 px-1">
            ⚡ Quick Role Selection for Reviewers:
          </p>
          {demoAccounts.map((account) => {
            const isSelected = email === account.email;
            return (
              <div
                key={account.email}
                onClick={() => handleSelectRole(account.email)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white border-teal-700 shadow-sm ring-1 ring-teal-700"
                    : "bg-stone-50/80 hover:bg-white border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {account.role}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    {account.email}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {account.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">{account.desc}</p>
                  </div>
                  {isSelected && (
                    <span className="text-teal-700 font-bold text-xs">✓ Selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Credentials Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-stone-200 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg shadow-xs focus:ring-teal-700 focus:border-teal-700 bg-stone-50 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg shadow-xs focus:ring-teal-700 focus:border-teal-700 bg-stone-50 text-stone-900"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="md"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Dashboard as {email.includes("admin") ? "Admin" : email.includes("priya") ? "Sales Exec" : "Buyer"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <Link href="/" className="hover:text-stone-900">
              ← Back to Project Site
            </Link>
            <Link href="/chat" className="text-teal-700 font-medium hover:underline">
              Open Buyer AI Chat →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
