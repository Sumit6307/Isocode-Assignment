import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const date = searchParams.get("date");
    const availableOnly = searchParams.get("availableOnly") !== "false";

    const where: any = {
      isActive: true,
    };

    if (projectId && projectId !== "ALL") where.projectId = projectId;
    if (date) where.date = date;

    // Fetch slots
    const slots = await prisma.visitSlot.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
            address: true,
            reraNumber: true,
            lat: true,
            lng: true,
          },
        },
        bookings: {
          include: {
            lead: {
              select: { id: true, leadId: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Filter available only if requested
    const filtered = availableOnly
      ? slots.filter((s) => s.bookedCount < s.maxCapacity)
      : slots;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, date, startTime, endTime, maxCapacity } = body;

    if (!projectId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required slot parameters" },
        { status: 400 }
      );
    }

    const slot = await prisma.visitSlot.create({
      data: {
        projectId,
        date,
        startTime,
        endTime,
        maxCapacity: maxCapacity || 3,
        bookedCount: 0,
        isActive: true,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({ success: true, data: slot });
  } catch (error: any) {
    console.error("Error creating slot:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A slot at this time for this project already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create slot" },
      { status: 500 }
    );
  }
}

