export interface Lead {
  id: string;
  leadId: string;
  name: string;
  email: string | null;
  phone: string;
  source: string;
  projectId: string | null;
  project?: Project | null;
  wants: string | null;
  budget: string | null;
  status: string;
  assignedToId: string | null;
  assignedTo?: User | null;
  isDuplicate: boolean;
  duplicateOfId: string | null;
  responseTime: number | null;
  firstResponseAt: string | null;
  consentGiven: boolean;
  language: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  chatSessions?: ChatSession[];
  visitBookings?: VisitBooking[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  reraNumber: string;
  location: string;
  address: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  description: string;
  priceMin: number;
  priceMax: number;
  configs: string;
  amenities: string;
  totalUnits: number;
  availableUnits: number;
  status: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FactSheetEntry {
  id: string;
  projectId: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  leadId: string;
  lead?: Lead;
  userId: string | null;
  status: string;
  summary: string | null;
  language: string;
  isFlagged: boolean;
  flagReason: string | null;
  handoffExecId: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  toolCall: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface VisitSlot {
  id: string;
  projectId: string;
  project?: Project;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bookings?: VisitBooking[];
}

export interface VisitBooking {
  id: string;
  slotId: string;
  slot?: VisitSlot;
  leadId: string;
  lead?: Lead;
  status: string;
  reminderSent: boolean;
  visitedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  avgResponseTime: number;
  medianResponseTime: number;
  leadsNotReachedIn48h: number;
  totalVisitsBooked: number;
  visitShowUpRate: number;
  costPerVisitBySource: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  responseTimeDistribution: { label: string; count: number }[];
  dailyLeadTrend: { date: string; count: number }[];
}

