"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/utils";

export default function SlotsAdminPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form
  const [newProjectId, setNewProjectId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:30");
  const [newCapacity, setNewCapacity] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlotsAndProjects();
  }, [selectedProjectId]);

  const fetchSlotsAndProjects = async () => {
    setLoading(true);
    try {
      const url =
        selectedProjectId !== "ALL"
          ? `/api/slots?projectId=${selectedProjectId}&availableOnly=false`
          : `/api/slots?availableOnly=false`;

      const [slotsRes, projRes] = await Promise.all([
        fetch(url),
        fetch("/api/projects"),
      ]);

      const slotsJson = await slotsRes.json();
      const projJson = await projRes.json();

      if (slotsJson.success) setSlots(slotsJson.data);
      if (projJson.success) {
        setProjects(projJson.data);
        if (projJson.data.length > 0 && !newProjectId) {
          setNewProjectId(projJson.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (slotId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/slots/${slotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSlotsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectId || !newDate || !newStartTime || !newEndTime) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: newProjectId,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          maxCapacity: Number(newCapacity),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchSlotsAndProjects();
      } else {
        alert(data.error || "Failed to create slot");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc: any, slot: any) => {
    acc[slot.date] = acc[slot.date] || [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-stone-200 px-8 py-5 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Site Visit Slot Capacity Manager
              </h1>
              <span className="text-xs bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full font-mono font-medium">
                {slots.length} Defined Slots
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure maximum buyer concurrency per slot to prevent double-booking at project sites.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Visit Slot
            </Button>
          </div>
        </header>

        {/* Slot Schedule Grid */}
        <div className="p-8 max-w-7xl w-full space-y-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">
              Loading appointment slots and live capacity...
            </div>
          ) : Object.keys(groupedSlots).length === 0 ? (
            <div className="py-20 text-center text-stone-400 text-xs">
              No slots configured. Click "Add Visit Slot" to create one.
            </div>
          ) : (
            Object.keys(groupedSlots)
              .sort()
              .map((date) => (
                <Card key={date} className="overflow-hidden">
                  <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-xs text-stone-900">
                        {formatDate(date)}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-500">
                      {groupedSlots[date].length} slots
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedSlots[date].map((slot: any) => {
                      const isFull = slot.bookedCount >= slot.maxCapacity;
                      const hasBookings = slot.bookedCount > 0;

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-xl border text-xs transition-all ${
                            !slot.isActive
                              ? "bg-stone-100/60 border-stone-200 opacity-60"
                              : isFull
                              ? "bg-rose-50/50 border-rose-200"
                              : "bg-white border-stone-200 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-stone-500" />
                              {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isFull
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isFull
                                ? "FULL"
                                : `${slot.bookedCount} / ${slot.maxCapacity} Booked`}
                            </span>
                          </div>

                          <p className="text-[11px] text-teal-800 font-medium mt-1 truncate">
                            {slot.project?.name}
                          </p>

                          {/* Capacity visual bar */}
                          <div className="mt-2.5 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull ? "bg-rose-500" : "bg-teal-700"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (slot.bookedCount / slot.maxCapacity) * 100
                                )}%`,
                              }}
                            />
                          </div>

                          {/* Booked attendees */}
                          {hasBookings && (
                            <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-600">
                              <span className="font-semibold text-stone-700">Attendees:</span>
                              <div className="mt-0.5 space-y-0.5">
                                {slot.bookings?.map((b: any) => (
                                  <div
                                    key={b.id}
                                    className="truncate flex items-center justify-between"
                                  >
                                    <span>• {b.lead?.name}</span>
                                    <span className="font-mono text-stone-400">
                                      {b.lead?.leadId}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">
                              Status: {slot.isActive ? "Active" : "Disabled"}
                            </span>
                            <button
                              onClick={() => handleToggleActive(slot.id, slot.isActive)}
                              className="text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                            >
                              {slot.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))
          )}
        </div>

        {/* Add Slot Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">
                  Add Site Visit Slot
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSlot} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Residential Project
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-teal-700 bg-white"
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Slot Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-teal-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-stone-700 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-stone-700 block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Max Capacity (Simultaneous Buyers)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-teal-700"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Once capacity is reached, the AI assistant will mark this slot unavailable.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={submitting}>
                    Create Slot
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
