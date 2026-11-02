"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/utils";

export default function VisitsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter !== "ALL"
          ? `/api/bookings?status=${statusFilter}`
          : `/api/bookings`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-stone-200 px-8 py-5 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Site Visit Appointments & Show-Up Tracking
              </h1>
              <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
                {bookings.length} Scheduled
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Track attendance, trigger reminders, and update physical visit outcomes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value="ALL">All Visit Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="VISITED">Visited (Show-Up)</option>
              <option value="NO_SHOW">No-Show</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Buyer Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Project Site</th>
                    <th className="py-3 px-4">Reminders</th>
                    <th className="py-3 px-4">Visit Status</th>
                    <th className="py-3 px-4 text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        Loading visit appointments...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/60">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          <div>{formatDate(b.slot.date)}</div>
                          <div className="text-[11px] text-teal-800 font-mono mt-0.5">
                            {formatTime(b.slot.startTime)} - {formatTime(b.slot.endTime)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Link
                            href={`/dashboard/leads/${b.lead.id}`}
                            className="font-bold text-stone-900 hover:text-teal-800 hover:underline"
                          >
                            {b.lead.name}
                          </Link>
                          <span className="block text-[10px] text-stone-400 font-mono">
                            {b.lead.leadId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-stone-600">
                          {b.lead.phone}
                        </td>

                        <td className="py-3.5 px-4 text-stone-800">
                          <div className="font-medium">{b.slot.project?.name}</div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{b.slot.project?.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            <BellRing className="w-3 h-3 text-emerald-600" />
                            24h & 2h Queued
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge status={b.status}>{b.status.replace(/_/g, " ")}</Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1">
                          {b.status !== "VISITED" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[11px] py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                              disabled={updatingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, "VISITED")}
                            >
                              ✓ Mark Visited
                            </Button>
                          )}

                          {b.status === "BOOKED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] py-1 px-2 text-rose-700 hover:bg-rose-50 border-rose-200"
                              disabled={updatingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, "NO_SHOW")}
                            >
                              No-Show
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
