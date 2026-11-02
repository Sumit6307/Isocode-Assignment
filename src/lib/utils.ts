import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getResponseTimeColor(seconds: number | null): string {
  if (seconds === null) return "text-gray-400";
  if (seconds <= 120) return "text-emerald-600"; // Under 2 mins
  if (seconds <= 300) return "text-amber-600"; // Under 5 mins
  return "text-red-600"; // Over 5 mins
}

export function formatResponseTime(seconds: number | null): string {
  if (seconds === null) return "Pending";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-yellow-100 text-yellow-700",
    QUALIFIED: "bg-purple-100 text-purple-700",
    SITE_VISIT_BOOKED: "bg-teal-100 text-teal-700",
    VISITED: "bg-emerald-100 text-emerald-700",
    HANDED_OFF: "bg-indigo-100 text-indigo-700",
    CLOSED: "bg-gray-100 text-gray-600",
    DUPLICATE: "bg-red-100 text-red-700",
    BOOKED: "bg-teal-100 text-teal-700",
    REMINDED_24H: "bg-amber-100 text-amber-700",
    REMINDED_2H: "bg-orange-100 text-orange-700",
    NO_SHOW: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    HANDED_OFF_CHAT: "bg-indigo-100 text-indigo-700",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    property_portal: "Property Portal",
    social_media: "Social Media",
    website: "Website",
    hoarding: "Hoarding",
    walk_in: "Walk-in",
  };
  return labels[source] || source;
}

export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    property_portal: "🏠",
    social_media: "📱",
    website: "🌐",
    hoarding: "📋",
    walk_in: "🚶",
  };
  return icons[source] || "📌";
}

export function generateLeadId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `LD-${num}`;
}

