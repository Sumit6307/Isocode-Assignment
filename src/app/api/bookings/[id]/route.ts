import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const booking = await prisma.visitBooking.findUnique({
      where: { id },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const previousStatus = booking.status;

    // Use transaction if status transition impacts slot capacity
    const updated = await prisma.$transaction(async (tx) => {
      // If cancelling from an active booking, decrement slot count
      if (
        status === "CANCELLED" &&
        ["BOOKED", "REMINDED_24H", "REMINDED_2H"].includes(previousStatus)
      ) {
        await tx.visitSlot.update({
          where: { id: booking.slotId },
          data: {
            bookedCount: { decrement: 1 },
          },
        });
      }

      // If reopening a cancelled booking, increment slot count
      if (
        previousStatus === "CANCELLED" &&
        ["BOOKED", "VISITED"].includes(status)
      ) {
        await tx.visitSlot.update({
          where: { id: booking.slotId },
          data: {
            bookedCount: { increment: 1 },
          },
        });
      }

      const updatedBooking = await tx.visitBooking.update({
        where: { id },
        data: {
          status,
          ...(notes !== undefined && { notes }),
          ...(status === "VISITED" && { visitedAt: new Date() }),
        },
        include: {
          lead: true,
          slot: {
            include: {
              project: true,
            },
          },
        },
      });

      // Also update lead status if visited
      if (status === "VISITED") {
        await tx.lead.update({
          where: { id: booking.leadId },
          data: { status: "VISITED" },
        });
      }

      return updatedBooking;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}
