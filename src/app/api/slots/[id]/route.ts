import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.visitSlot.update({
      where: { id },
      data: {
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
        ...(body.maxCapacity !== undefined && { maxCapacity: body.maxCapacity }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating slot:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if slot has active bookings
    const bookingsCount = await prisma.visitBooking.count({
      where: {
        slotId: id,
        status: { in: ["BOOKED", "REMINDED_24H", "REMINDED_2H"] },
      },
    });

    if (bookingsCount > 0) {
      // Soft-delete (deactivate) instead of hard delete to preserve booking history
      await prisma.visitSlot.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Slot deactivated because it has existing bookings",
      });
    }

    await prisma.visitSlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Slot deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete slot" },
      { status: 500 }
    );
  }
}
