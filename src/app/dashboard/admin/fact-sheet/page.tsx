"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Filter,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function FactSheetAdminPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  // Form fields
  const [formProject, setFormProject] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedProjectId, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, factRes] = await Promise.all([
        fetch("/api/projects"),
        fetch(
          `/api/fact-sheet?projectId=${selectedProjectId}&category=${selectedCategory}`
        ),
      ]);

      const projJson = await projRes.json();
      const factJson = await factRes.json();

      if (projJson.success) setProjects(projJson.data);
      if (factJson.success) setEntries(factJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormProject(projects[0]?.id || "");
    setFormCategory("General");
    setFormQuestion("");
    setFormAnswer("");
    setShowModal(true);
  };

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormProject(entry.projectId);
    setFormCategory(entry.category);
    setFormQuestion(entry.question);
    setFormAnswer(entry.answer);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this fact from the AI assistant?")) return;
    try {
      const res = await fetch(`/api/fact-sheet/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingEntry
        ? `/api/fact-sheet/${editingEntry.id}`
        : `/api/fact-sheet`;
      const method = editingEntry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: formProject,
          category: formCategory,
          question: formQuestion,
          answer: formAnswer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.error || "Failed to save fact sheet entry");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
                Sales Head Fact Sheet Editor
              </h1>
              <span className="text-xs bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full font-mono font-medium">
                {entries.length} Ground-Truth Facts
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              The AI Assistant strictly answers from this verified knowledge repository to prevent inaccurate claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAdd}
            >
              Add New Verified Fact
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="p-8 pb-4 max-w-7xl w-full flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:ring-teal-700"
          >
            <option value="ALL">All Residential Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:ring-teal-700"
          >
            <option value="ALL">All Fact Categories</option>
            <option value="Pricing">Pricing & Payment Plans</option>
            <option value="Specifications">Apartment Specifications</option>
            <option value="Amenities">Amenities & Lifestyle</option>
            <option value="Legal">Legal & RERA Details</option>
            <option value="Location">Location & Distances</option>
            <option value="General">General Inquiries</option>
          </select>
        </div>

        {/* Fact Sheet Entries Table */}
        <div className="px-8 pb-10 max-w-7xl w-full">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-44">Project</th>
                    <th className="py-3 px-4 w-32">Category</th>
                    <th className="py-3 px-4 w-64">Buyer Question</th>
                    <th className="py-3 px-4">Official Verified Answer</th>
                    <th className="py-3 px-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        Loading fact sheet repository...
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        No entries match this filter.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-stone-50/60">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          {entry.project?.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono text-[10px]">
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-800">
                          {entry.question}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 leading-relaxed">
                          {entry.answer}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">
                  {editingEntry ? "Edit Ground-Truth Fact" : "Add New Ground-Truth Fact"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-stone-700 block mb-1">
                      Project
                    </label>
                    <select
                      value={formProject}
                      onChange={(e) => setFormProject(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
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
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                    >
                      <option value="Pricing">Pricing</option>
                      <option value="Specifications">Specifications</option>
                      <option value="Amenities">Amenities</option>
                      <option value="Legal">Legal & RERA</option>
                      <option value="Location">Location</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Buyer Question or Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Are home loans available?"
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="font-medium text-stone-700 block mb-1">
                    Official Answer (AI Ground Truth)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide the exact factual answer approved by the Sales Head..."
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={submitting}>
                    Save Ground Truth
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
