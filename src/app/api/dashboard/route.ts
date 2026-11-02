import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        visitBookings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLeads = leads.length;

    // Today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newLeadsToday = leads.filter(
      (l) => new Date(l.createdAt) >= today
    ).length;

    // Response times calculation
    const responseTimes = leads
      .filter((l) => l.responseTime !== null && l.responseTime !== undefined)
      .map((l) => l.responseTime as number)
      .sort((a, b) => a - b);

    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((acc, curr) => acc + curr, 0) /
              responseTimes.length
          )
        : 0;

    const medianResponseTime =
      responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length / 2)]
        : 0;

    // Leads not reached within 48h: status is still NEW and older than 48 hours, or no responseTime and created >48h ago
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const leadsNotReachedIn48h = leads.filter((l) => {
      const isOld = new Date(l.createdAt) < fortyEightHoursAgo;
      const isUnresponded = l.responseTime === null || l.status === "NEW";
      return isOld && isUnresponded;
    }).length;

    const unreachedRate =
      totalLeads > 0
        ? ((leadsNotReachedIn48h / totalLeads) * 100).toFixed(1)
        : "0";

    // Visit statistics
    const bookings = await prisma.visitBooking.findMany();
    const totalVisitsBooked = bookings.length;
    const completedVisits = bookings.filter((b) => b.status === "VISITED").length;
    const visitShowUpRate =
      totalVisitsBooked > 0
        ? Math.round((completedVisits / totalVisitsBooked) * 100)
        : 0;

    // Source Breakdown & Cost Per Visit
    // Assumption from brief: ₹1,000 ad spend per lead
    const COST_PER_LEAD = 1000;
    const leadsBySource: Record<string, number> = {};
    const visitsBySource: Record<string, number> = {};

    leads.forEach((l) => {
      leadsBySource[l.source] = (leadsBySource[l.source] || 0) + 1;
      const hasBooking = l.visitBookings && l.visitBookings.length > 0;
      if (hasBooking) {
        visitsBySource[l.source] = (visitsBySource[l.source] || 0) + 1;
      }
    });

    const costPerVisitBySource: Record<string, number> = {};
    Object.keys(leadsBySource).forEach((source) => {
      const leadCount = leadsBySource[source];
      const visitCount = visitsBySource[source] || 0;
      const totalSpend = leadCount * COST_PER_LEAD;
      costPerVisitBySource[source] =
        visitCount > 0 ? Math.round(totalSpend / visitCount) : totalSpend;
    });

    // Leads By Status
    const leadsByStatus: Record<string, number> = {};
    leads.forEach((l) => {
      leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
    });

    // Response Time Distribution
    const distribution = [
      { label: "< 2 min (AI instant)", count: 0 },
      { label: "2 - 5 min (Target)", count: 0 },
      { label: "5 - 15 min", count: 0 },
      { label: "15 - 60 min", count: 0 },
      { label: "1 - 24 hours", count: 0 },
      { label: "Unreached / >24h", count: 0 },
    ];

    leads.forEach((l) => {
      const rt = l.responseTime;
      if (rt === null || rt === undefined) {
        distribution[5].count++;
      } else if (rt <= 120) {
        distribution[0].count++;
      } else if (rt <= 300) {
        distribution[1].count++;
      } else if (rt <= 900) {
        distribution[2].count++;
      } else if (rt <= 3600) {
        distribution[3].count++;
      } else if (rt <= 86400) {
        distribution[4].count++;
      } else {
        distribution[5].count++;
      }
    });

    // Daily Trend for the last 14 days
    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }

    leads.forEach((l) => {
      const key = new Date(l.createdAt).toISOString().split("T")[0];
      if (dailyMap[key] !== undefined) {
        dailyMap[key]++;
      }
    });

    const dailyLeadTrend = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Financial impact metrics
    const wastedLeadsEstimate = leadsNotReachedIn48h;
    const monthlyWastedSpend = wastedLeadsEstimate * COST_PER_LEAD;
    const annualWastedSpend = monthlyWastedSpend * 12;

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        newLeadsToday,
        avgResponseTime,
        medianResponseTime,
        leadsNotReachedIn48h,
        unreachedRate,
        totalVisitsBooked,
        completedVisits,
        visitShowUpRate,
        costPerVisitBySource,
        leadsBySource,
        visitsBySource,
        leadsByStatus,
        responseTimeDistribution: distribution,
        dailyLeadTrend,
        financials: {
          costPerLead: COST_PER_LEAD,
          wastedLeadsEstimate,
          monthlyWastedSpend,
          annualWastedSpend,
        },
      },
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
