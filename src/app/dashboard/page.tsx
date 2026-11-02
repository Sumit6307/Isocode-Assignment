"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  Users,
  CalendarCheck,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatResponseTime, getResponseTimeColor, getSourceLabel, getSourceIcon } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stone-100 font-sans">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center text-xs text-stone-500">
          Loading executive metrics...
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Median Response Time",
      value: formatResponseTime(data?.medianResponseTime),
      subtext: "Target: < 5 mins (Previous: 14 hours)",
      icon: Clock,
      status: "good",
      change: "-98.9%",
    },
    {
      title: "Leads Reached in 48h",
      value: `${(100 - parseFloat(data?.unreachedRate || "0")).toFixed(1)}%`,
      subtext: `${data?.leadsNotReachedIn48h || 0} uncontacted (Target: >95%)`,
      icon: Users,
      status: "good",
      change: "+30.2%",
    },
    {
      title: "Site Visit Show-Up Rate",
      value: `${data?.visitShowUpRate || 0}%`,
      subtext: `${data?.completedVisits || 0} visited of ${data?.totalVisitsBooked || 0} booked`,
      icon: CalendarCheck,
      status: "good",
      change: "+8.4%",
    },
    {
      title: "Annual Savings from AI",
      value: `₹${((3000 * 0.3 * 1000 * 12) / 100000).toFixed(1)} Lakh`,
      subtext: "Preventing cold lead loss across 3,000 monthly leads",
      icon: IndianRupee,
      status: "highlight",
      change: "₹1.08 Cr",
    },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-8 py-5 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Executive Analytics & Lead Performance
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live tracking for Aavkar Realty (420 Apartments • Shela & Bopal)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/leads">
              <Button size="sm" variant="outline">
                View Lead Desk
              </Button>
            </Link>
            <Link href="/chat" target="_blank">
              <Button size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Test AI Assistant
              </Button>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-6 max-w-7xl w-full">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card key={idx} className="relative overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500">
                        {kpi.title}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-stone-950 tracking-tight">
                        {kpi.value}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center">
                        <ArrowUpRight className="w-3 h-3" />
                        {kpi.change}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-stone-500 leading-tight">
                      {kpi.subtext}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Middle Row: Response Time & Cost Per Visit Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Response Time Distribution */}
            <Card className="lg:col-span-6">
              <CardHeader
                title="Lead Response Time Distribution"
                subtitle="Goal: Under 2 min for all digital leads (Previously 14h median)"
              />
              <CardContent className="space-y-3.5">
                {data?.responseTimeDistribution?.map((bucket: any, i: number) => {
                  const total = data?.totalLeads || 1;
                  const pct = Math.round((bucket.count / total) * 100);
                  const isFast = i <= 1;

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700">
                          {bucket.label}
                        </span>
                        <span className="text-stone-500 font-mono">
                          {bucket.count} leads ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFast ? "bg-teal-700" : i <= 3 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-200/80 text-teal-950 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    AI Advantage:
                  </div>
                  <p className="text-[11px] text-teal-800 mt-0.5">
                    95% of portal and social media inquiries now receive verified pricing & RERA answers in <strong>under 2 minutes</strong>, preventing lead leakage to competitor projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Per Visit by Source */}
            <Card className="lg:col-span-6">
              <CardHeader
                title="Cost Per Site Visit by Inbound Source"
                subtitle="Ad spend ₹1,000/lead vs actual site visits delivered"
              />
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Channel</th>
                      <th className="py-2.5 px-3 text-right">Leads</th>
                      <th className="py-2.5 px-3 text-right">Visits</th>
                      <th className="py-2.5 px-3 text-right">Conv %</th>
                      <th className="py-2.5 px-4 text-right">Cost / Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {Object.keys(data?.leadsBySource || {}).map((source) => {
                      const leads = data.leadsBySource[source] || 0;
                      const visits = data.visitsBySource[source] || 0;
                      const conv = leads > 0 ? ((visits / leads) * 100).toFixed(1) : "0.0";
                      const costPerVisit = data.costPerVisitBySource[source] || 0;

                      return (
                        <tr key={source} className="hover:bg-stone-50/50">
                          <td className="py-3 px-4 font-medium text-stone-900 flex items-center gap-1.5">
                            <span>{getSourceIcon(source)}</span>
                            <span>{getSourceLabel(source)}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-stone-600">
                            {leads}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-teal-800">
                            {visits}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-stone-600">
                            {conv}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                            ₹{costPerVisit.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Lead Pipeline Status & 14-day Ingestion Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Pipeline */}
            <Card className="lg:col-span-5">
              <CardHeader
                title="Lead Pipeline by Status"
                subtitle="From first enquiry to site visit completed"
              />
              <CardContent className="space-y-2.5">
                {Object.entries(data?.leadsByStatus || {}).map(([status, count]: any) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-xs"
                  >
                    <Badge status={status}>{status.replace(/_/g, " ")}</Badge>
                    <span className="font-bold text-stone-900 font-mono">
                      {count} leads
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Daily Ingestion Trend */}
            <Card className="lg:col-span-7">
              <CardHeader
                title="14-Day Inbound Lead Trend"
                subtitle="Daily lead velocity across portal, website, and ad channels"
              />
              <CardContent>
                <div className="h-44 flex items-end gap-2 pt-6 pb-2">
                  {data?.dailyLeadTrend?.map((item: any, i: number) => {
                    const heightPct = Math.min(100, Math.max(15, item.count * 20));
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                      >
                        <span className="text-[10px] font-mono text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </span>
                        <div
                          className="w-full bg-teal-700/80 hover:bg-teal-800 rounded-t-sm transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[9px] text-stone-400 font-mono truncate w-full text-center">
                          {item.date.split("-").slice(1).join("/")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

