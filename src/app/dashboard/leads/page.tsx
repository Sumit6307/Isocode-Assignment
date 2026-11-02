"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  formatResponseTime,
  getResponseTimeColor,
  getSourceLabel,
  getSourceIcon,
} from "@/lib/utils";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New lead form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("property_portal");
  const [newWants, setNewWants] = useState("3 BHK");
  const [newProjectId, setNewProjectId] = useState("");
  const [creating, setCreating] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, projectFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (sourceFilter !== "ALL") params.set("source", sourceFilter);
      if (projectFilter !== "ALL") params.set("projectId", projectFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setDuplicateWarning(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail || undefined,
          source: newSource,
          wants: newWants,
          projectId: newProjectId || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.duplicateWarning) {
          setDuplicateWarning(data.duplicateWarning);
        } else {
          setShowAddModal(false);
          resetForm();
        }
        fetchLeads();
      } else {
        alert(data.error || "Failed to create lead");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewSource("property_portal");
    setNewWants("3 BHK");
    setNewProjectId("");
    setDuplicateWarning(null);
  };

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 px-8 py-5 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Inbound Lead Desk
              </h1>
              <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
                {leads.length} Leads
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Multi-source lead capture with automated duplicate phone/email detection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddModal(true)}
            >
              Add New Lead
            </Button>
          </div>
        </header>

        {/* Filter and Search Bar */}
        <div className="p-8 pb-4 max-w-7xl w-full">
          <Card className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Lead ID (e.g. LD-58210), Name, Phone, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white text-stone-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="SITE_VISIT_BOOKED">Site Visit Booked</option>
                <option value="VISITED">Visited</option>
                <option value="HANDED_OFF">Handed Off</option>
                <option value="DUPLICATE">Duplicates</option>
              </select>

              {/* Source filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white text-stone-700 cursor-pointer"
              >
                <option value="ALL">All Sources</option>
                <option value="property_portal">Property Portal</option>
                <option value="social_media">Social Media</option>
                <option value="website">Website</option>
                <option value="hoarding">Hoarding Call</option>
                <option value="walk_in">Walk-in</option>
              </select>

              <Button type="submit" size="sm" variant="secondary">
                Filter
              </Button>
            </form>
          </Card>
        </div>

        {/* Lead Table */}
        <div className="px-8 pb-10 max-w-7xl w-full">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Lead ID</th>
                    <th className="py-3 px-4">Buyer Name & Contact</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Wants</th>
                    <th className="py-3 px-4">Response Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-stone-400">
                        Loading lead records...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-stone-400">
                        No leads match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const hasBooking =
                        lead.visitBookings && lead.visitBookings.length > 0;
                      const booking = hasBooking ? lead.visitBookings[0] : null;

                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-stone-50/70 transition-colors"
                        >
                          {/* Lead ID + Duplicate indicator */}
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                            <div className="flex items-center gap-1.5">
                              <span>{lead.leadId}</span>
                              {lead.isDuplicate && (
                                <span
                                  title="Duplicate contact detected"
                                  className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-sans font-bold flex items-center gap-0.5"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                  DUP
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Name & Phone */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-stone-900">
                              {lead.name}
                            </p>
                            <p className="text-[11px] text-stone-500 font-mono">
                              {lead.phone}
                            </p>
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]">
                              <span>{getSourceIcon(lead.source)}</span>
                              <span>{getSourceLabel(lead.source)}</span>
                            </span>
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4 text-stone-800">
                            {lead.project?.name || "General"}
                          </td>

                          {/* Wants */}
                          <td className="py-3.5 px-4 font-medium text-stone-700">
                            {lead.wants || "2/3 BHK"}
                          </td>

                          {/* Response Time */}
                          <td className="py-3.5 px-4 font-mono">
                            <span
                              className={`font-semibold flex items-center gap-1 ${getResponseTimeColor(
                                lead.responseTime
                              )}`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatResponseTime(lead.responseTime)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <Badge status={lead.status}>
                              {lead.status.replace(/_/g, " ")}
                            </Badge>
                            {booking && (
                              <p className="text-[10px] text-teal-800 font-semibold mt-1">
                                📅 {booking.slot?.date}
                              </p>
                            )}
                          </td>

                          {/* Assigned To */}
                          <td className="py-3.5 px-4 text-stone-600 text-[11px]">
                            {lead.assignedTo?.name || "— (Unassigned)"}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs py-1 px-2.5"
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                              >
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Add Lead Modal with Duplicate Detection */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">
                  Add New Inbound Lead
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                >
                  ✕
                </button>
              </div>

              {duplicateWarning && (
                <div className="my-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Duplicate Contact Detected!
                  </div>
                  <p className="mt-1 text-[11px]">
                    A lead with this phone number or email already exists:{" "}
                    <strong>{duplicateWarning.originalName}</strong> (
                    <code>{duplicateWarning.originalLeadId}</code>). The lead was created and tagged as <code>DUPLICATE</code>.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2.5"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Acknowledge & Close
                  </Button>
                </div>
              )}

              {!duplicateWarning && (
                <form onSubmit={handleCreateLead} className="space-y-3.5 mt-4 text-xs">
                  <div>
                    <label className="font-medium text-stone-700">Buyer Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-stone-700">Phone Number (Mandatory for Dedup)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-stone-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="buyer@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-stone-700">Inbound Source</label>
                      <select
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                      >
                        <option value="property_portal">Property Portal</option>
                        <option value="social_media">Social Media Ad</option>
                        <option value="website">Website</option>
                        <option value="hoarding">Hoarding Call</option>
                        <option value="walk_in">Walk-in</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-stone-700">Configuration</label>
                      <select
                        value={newWants}
                        onChange={(e) => setNewWants(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                      >
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="Both">Both 2 & 3 BHK</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" loading={creating}>
                      Save Lead
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
