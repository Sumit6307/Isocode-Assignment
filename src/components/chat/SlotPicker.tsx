"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface SlotPickerProps {
  leadId: string;
  projectId?: string;
  onBookingSuccess?: (bookingData: any) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  leadId,
  projectId,
  onBookingSuccess,
}) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [projectId]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const url = projectId
        ? `/api/slots?projectId=${projectId}&availableOnly=true`
        : `/api/slots?availableOnly=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setSlots(data.data);
        if (data.data.length > 0) {
          setSelectedDate(data.data[0].date);
        }
      }
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group slots by date
  const uniqueDates = Array.from(new Set(slots.map((s) => s.date))).sort();
  const currentSlots = slots.filter((s) => s.date === selectedDate);

  const handleBook = async () => {
    if (!selectedSlotId || !leadId) return;

    setBookingLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          leadId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to book site visit");
      }

      setBookingConfirmed(data.data);
      if (onBookingSuccess) {
        onBookingSuccess(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 my-2">
        <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Site Visit Confirmed!
        </div>
        <div className="text-xs space-y-1.5 text-stone-700">
          <p>
            <strong>Project:</strong> {bookingConfirmed.project?.name}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(bookingConfirmed.slot.date)} at{" "}
            {formatTime(bookingConfirmed.slot.startTime)} -{" "}
            {formatTime(bookingConfirmed.slot.endTime)}
          </p>
          <p className="flex items-center gap-1 text-teal-800">
            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <a
              href={bookingConfirmed.project?.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="underline font-medium hover:text-teal-950"
            >
              Open Location Pin in Google Maps
            </a>
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-[11px] text-stone-500 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>Automated WhatsApp / SMS reminders scheduled:</span>
          </div>
          <p>• 1 day before visit at 09:00 AM</p>
          <p>• 2 hours before your scheduled appointment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3.5 my-2 shadow-xs max-w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
          <Calendar className="w-3.5 h-3.5 text-teal-700" />
          Choose a Free Site Visit Slot
        </div>
        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
          No double booking
        </span>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-stone-400">
          Loading available slots...
        </div>
      ) : uniqueDates.length === 0 ? (
        <div className="py-4 text-center text-xs text-stone-500">
          No upcoming slots currently available. Please request a custom time.
        </div>
      ) : (
        <>
          {/* Date selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {uniqueDates.map((date) => {
              const d = new Date(date);
              const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString("en-IN", { month: "short" });
              const isSelected = selectedDate === date;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlotId("");
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center ${
                    isSelected
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    {dayName}
                  </div>
                  <div className="font-semibold text-xs">
                    {dayNum} {month}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time slots for selected date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
            {currentSlots.map((slot) => {
              const remaining = slot.maxCapacity - slot.bookedCount;
              const isSelected = selectedSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-teal-700 bg-teal-50/60 ring-1 ring-teal-700"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      {remaining} {remaining === 1 ? "spot" : "spots"} left
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 truncate">
                    {slot.project?.name || "Project site"}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirm booking button */}
          <div className="mt-3">
            <Button
              size="sm"
              fullWidth
              disabled={!selectedSlotId || bookingLoading}
              loading={bookingLoading}
              onClick={handleBook}
            >
              Confirm Site Visit Reservation
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
