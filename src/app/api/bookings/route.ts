import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatTime, formatDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const status = searchParams.get("status");

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (status && status !== "ALL") where.status = status;

    const bookings = await prisma.visitBooking.findMany({
      where,
      include: {
        lead: true,
        slot: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, leadId, notes } = body;

    if (!slotId || !leadId) {
      return NextResponse.json(
        { success: false, error: "slotId and leadId are required" },
        { status: 400 }
      );
    }

    // Atomic transaction to completely prevent double booking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch slot with current capacity check
      const slot = await tx.visitSlot.findUnique({
        where: { id: slotId },
        include: {
          project: true,
        },
      });

      if (!slot) {
        throw new Error("SLOT_NOT_FOUND");
      }

      if (!slot.isActive) {
        throw new Error("SLOT_INACTIVE");
      }

      // Check capacity
      if (slot.bookedCount >= slot.maxCapacity) {
        throw new Error("SLOT_FULL");
      }

      // 2. Check if lead already booked this slot
      const existing = await tx.visitBooking.findUnique({
        where: {
          slotId_leadId: {
            slotId,
            leadId,
          },
        },
      });

      if (existing && existing.status !== "CANCELLED") {
        throw new Error("ALREADY_BOOKED");
      }

      // 3. Create or reactivate the booking
      const booking = await tx.visitBooking.upsert({
        where: {
          slotId_leadId: {
            slotId,
            leadId,
          },
        },
        create: {
          slotId,
          leadId,
          status: "BOOKED",
          notes: notes || null,
        },
        update: {
          status: "BOOKED",
          notes: notes || null,
        },
      });

      // 4. Atomically increment slot bookedCount
      const updatedSlot = await tx.visitSlot.update({
        where: { id: slotId },
        data: {
          bookedCount: { increment: 1 },
        },
      });

      // 5. Update lead status
      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: "SITE_VISIT_BOOKED",
          projectId: slot.projectId,
        },
      });

      return { booking, slot, updatedSlot };
    });

    // Generate location pin & mock reminders metadata
    const project = result.slot.project;
    const mapsUrl = project.lat && project.lng
      ? `https://www.google.com/maps?q=${project.lat},${project.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address || project.location)}`;

    const reminderSchedule = [
      {
        type: "24_HOURS_BEFORE",
        triggerTime: "1 day before at 09:00 AM",
        channel: "WhatsApp / SMS",
        message: `Reminder: Your site visit for ${project.name} is scheduled for tomorrow at ${formatTime(result.slot.startTime)}. Location: ${project.location}. Directions: ${mapsUrl}`,
      },
      {
        type: "2_HOURS_BEFORE",
        triggerTime: "2 hours before visit",
        channel: "WhatsApp / SMS",
        message: `Reminder: Your site visit for ${project.name} is in 2 hours (${formatTime(result.slot.startTime)}). Our sales executive will meet you at the reception. Location: ${mapsUrl}`,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        booking: result.booking,
        slot: result.slot,
        project: {
          name: project.name,
          reraNumber: project.reraNumber,
          location: project.location,
          address: project.address,
          mapsUrl,
          lat: project.lat,
          lng: project.lng,
        },
        reminders: reminderSchedule,
      },
    });
  } catch (error: any) {
    console.error("Booking error:", error);

    if (error.message === "SLOT_FULL") {
      return NextResponse.json(
        {
          success: false,
          error: "This slot was just filled by another buyer. Please choose another available slot.",
          code: "SLOT_FULL",
        },
        { status: 409 }
      );
    }

    if (error.message === "ALREADY_BOOKED") {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reserved this site visit slot.",
          code: "ALREADY_BOOKED",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to book slot" },
      { status: 500 }
    );
  }
}

