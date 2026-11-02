"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileText,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  formatTime,
  formatResponseTime,
  getResponseTimeColor,
  getSourceLabel,
} from "@/lib/utils";

function LeadDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<any | null>(null);
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [selectedExecId, setSelectedExecId] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetchLeadAndExecs();
  }, [id]);

  const fetchLeadAndExecs = async () => {
    setLoading(true);
    try {
      const [leadRes, execRes] = await Promise.all([
        fetch(`/api/leads/${id}`),
        fetch("/api/executives"),
      ]);

      const leadJson = await leadRes.json();
      const execJson = await execRes.json();

      if (leadJson.success && leadJson.data) {
        setLead(leadJson.data);
      }
      if (execJson.success && execJson.data) {
        setExecutives(execJson.data);
        if (execJson.data.length > 0) {
          setSelectedExecId(execJson.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading lead details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHandoff = async () => {
    if (!selectedExecId || !lead) return;

    setHandoffLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executiveId: selectedExecId,
          notes: handoffNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHandoffSuccess(data.data);
        setShowHandoffModal(false);
        fetchLeadAndExecs();
      } else {
        alert(data.error || "Failed to complete handoff");
      }
    } catch (err) {
      console.error("Handoff error:", err);
    } finally {
      setHandoffLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stone-100 font-sans">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center text-xs text-stone-500">
          Loading lead record & transcripts...
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen bg-stone-100 font-sans">
        <Sidebar />
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-stone-500">
          <p className="text-sm font-semibold">Lead record not found</p>
          <Link href="/dashboard/leads" className="mt-2 text-xs text-teal-800 underline">
            Return to Lead Desk
          </Link>
        </div>
      </div>
    );
  }

  const activeChat = lead.chatSessions?.[0];
  const messages = activeChat?.messages || [];
  const booking = lead.visitBookings?.[0];

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-8 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/leads"
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  {lead.name}
                </h1>
                <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full">
                  {lead.leadId}
                </span>
                <Badge status={lead.status}>{lead.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Captured from {getSourceLabel(lead.source)} • {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowHandoffModal(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Hand Off to Sales Executive
            </Button>
          </div>
        </header>

        {/* Handoff Success Toast */}
        {handoffSuccess && (
          <div className="mx-8 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Handoff Completed to {handoffSuccess.assignedTo}!
              </div>
              <p className="text-stone-600 mt-1 whitespace-pre-line text-[11px]">
                {handoffSuccess.summary}
              </p>
            </div>
            <button
              onClick={() => setHandoffSuccess(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="p-8 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Lead Info & Site Visit Status (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Buyer Profile Card */}
            <Card>
              <CardHeader title="Buyer Profile & Inbound Specs" />
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Phone Number</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {lead.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Email Address</span>
                  <span className="font-mono text-stone-700">
                    {lead.email || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Target Project</span>
                  <span className="font-medium text-stone-900">
                    {lead.project?.name || "Unspecified"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Configuration Desired</span>
                  <span className="font-semibold text-teal-800">
                    {lead.wants || "2/3 BHK"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Budget Range</span>
                  <span className="font-medium text-stone-900">
                    {lead.budget || "₹65L - ₹1.2Cr"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">First Response Time</span>
                  <span
                    className={`font-mono font-bold ${getResponseTimeColor(
                      lead.responseTime
                    )}`}
                  >
                    {formatResponseTime(lead.responseTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Assigned Executive</span>
                  <span className="font-semibold text-stone-900">
                    {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Site Visit Card */}
            <Card>
              <CardHeader
                title="Site Visit Reservation"
                subtitle="Real-time booking with no double-booking guarantee"
              />
              <CardContent className="text-xs">
                {booking ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-teal-900">
                          {booking.slot?.project?.name}
                        </span>
                        <Badge status={booking.status}>{booking.status}</Badge>
                      </div>

                      <div className="mt-2 text-[11px] space-y-1 text-stone-700">
                        <p>
                          📅 <strong>Date:</strong> {formatDate(booking.slot?.date)}
                        </p>
                        <p>
                          🕐 <strong>Time:</strong>{" "}
                          {formatTime(booking.slot?.startTime)} -{" "}
                          {formatTime(booking.slot?.endTime)}
                        </p>
                        <p className="flex items-center gap-1 text-teal-800 font-medium pt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{booking.slot?.project?.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-600 space-y-1">
                      <p className="font-semibold text-stone-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-700" />
                        Automated Reminders:
                      </p>
                      <p>• 24h Before: Sent 1 day prior at 09:00 AM</p>
                      <p>• 2h Before: Sent 2 hours prior with Google Maps pin</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-stone-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p>No site visit booked yet.</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      The AI assistant will propose slots during the next conversation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales Notes Card */}
            <Card>
              <CardHeader title="Internal Consultation Notes" />
              <CardContent className="text-xs text-stone-600">
                <p className="whitespace-pre-line bg-stone-50 p-3 rounded-lg border border-stone-100 font-mono text-[11px]">
                  {lead.notes || "No internal notes recorded yet."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Embedded Chat Transcript (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="h-full flex flex-col">
              <CardHeader
                title="AI Conversation History & Audit Trail"
                subtitle={`Session: ${activeChat ? activeChat.id.slice(0, 12) : "None"} • Language: ${activeChat?.language || "en"}`}
                action={
                  activeChat?.isFlagged ? (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Flagged for Sales Head Review
                    </span>
                  ) : null
                }
              />

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/40 max-h-[600px]">
                {messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-stone-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    No chat transcript recorded for this lead yet.
                  </div>
                ) : (
                  messages.map((m: any, i: number) => {
                    const isUser = m.role === "user";
                    const isSystem = m.role === "system";

                    if (isSystem) {
                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-stone-200/60 rounded-lg text-stone-700 text-center text-xs font-mono"
                        >
                          {m.content}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isUser
                              ? "bg-teal-700 text-white rounded-br-xs"
                              : "bg-white text-stone-900 border border-stone-200 shadow-2xs rounded-bl-xs"
                          }`}
                        >
                          <div className="whitespace-pre-line">{m.content}</div>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isUser ? "text-teal-200" : "text-stone-400"
                            }`}
                          >
                            {m.createdAt ? formatTime(new Date(m.createdAt).toTimeString().slice(0, 5)) : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>

              {activeChat?.summary && (
                <div className="p-3.5 bg-teal-50 border-t border-teal-100 text-xs text-teal-950">
                  <span className="font-bold flex items-center gap-1 text-teal-900">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    AI Auto-Summary:
                  </span>
                  <p className="mt-0.5 text-[11px] text-teal-800">
                    {activeChat.summary}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Handoff Modal */}
        {showHandoffModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">
                  Hand Off Lead to Named Sales Executive
                </h3>
                <button
                  onClick={() => setShowHandoffModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Select Sales Executive
                  </label>
                  <select
                    value={selectedExecId}
                    onChange={(e) => setSelectedExecId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                  >
                    {executives.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.phone || ex.email}) • {ex._count?.assignedLeads || 0} active leads
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Handoff Context & Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Buyer is interested in 3 BHK Tower B top floor. Ready for booking discussion."
                    value={handoffNotes}
                    onChange={(e) => setHandoffNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-[11px] text-stone-500">
                  ⚡ All existing chat transcripts, lead requirements, and booked visit slots will be transferred to the named executive immediately.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHandoffModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={handoffLoading}
                  onClick={handleHandoff}
                >
                  Confirm Handoff
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-stone-400">Loading lead record...</div>}>
      <LeadDetailContent />
    </React.Suspense>
  );
}
