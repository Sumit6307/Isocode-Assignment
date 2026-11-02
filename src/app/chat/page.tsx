"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, ShieldCheck, MapPin, ArrowLeft, PhoneCall } from "lucide-react";
import { ChatBox } from "@/components/chat/ChatBox";

function ChatContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project") || undefined;
  const leadIdParam = searchParams.get("leadId") || undefined;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                <Building2 className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-stone-900">
                  Aavkar Realty • Concierge Assistant
                </h1>
                <p className="text-[10px] text-stone-500">
                  Gujarat RERA Registered Residential Projects
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/dashboard"
              className="text-teal-800 hover:text-teal-950 font-medium px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 transition-colors"
            >
              Reviewer Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Main chat container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: AI Chat Box (takes 8 cols) */}
        <div className="lg:col-span-8 h-[78vh] min-h-[550px] flex flex-col">
          <ChatBox
            initialProjectId={projectParam}
            initialLeadId={leadIdParam}
          />
        </div>

        {/* Right column: Project quick facts & verified RERA information */}
        <div className="lg:col-span-4 space-y-4 hidden lg:block">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Project Information
            </h3>

            <div className="space-y-4 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="font-bold text-stone-900">1. Shubh Residency</p>
                <p className="text-[11px] text-stone-500">Near Shela Lake, Ahmedabad</p>
                <p className="text-teal-800 font-semibold mt-1">₹65L - ₹95L (2 & 3 BHK)</p>
                <p className="font-mono text-[10px] text-stone-400 mt-1">
                  RERA: PR/GJ/AHMEDABAD/RAA10000
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="font-bold text-stone-900">2. Aarambh Heights</p>
                <p className="text-[11px] text-stone-500">Near Bopal Lake, Ahmedabad</p>
                <p className="text-teal-800 font-semibold mt-1">₹78L - ₹1.2Cr (2 & 3 BHK)</p>
                <p className="font-mono text-[10px] text-stone-400 mt-1">
                  RERA: PR/GJ/AHMEDABAD/RAA10001
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1.5">
              <p>• <strong>Response Guarantee:</strong> 24/7 AI answers within 2 minutes</p>
              <p>• <strong>Site Visits:</strong> Instant slot reservation with no double booking</p>
              <p>• <strong>Language:</strong> English, Hindi (हिंदी), and Gujarati (ગુજરાતી)</p>
            </div>
          </div>

          <div className="bg-teal-900 text-teal-100 p-4 rounded-2xl shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-teal-300" />
              Need to talk to a person?
            </h4>
            <p className="text-[11px] text-teal-200 leading-relaxed">
              Simply ask the assistant for a sales executive at any time. Your inquiry will be transferred to our senior team with your complete chat transcript.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading AI Assistant...</div>}>
      <ChatContent />
    </Suspense>
  );
}

