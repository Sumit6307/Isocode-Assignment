import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findFirst({
      where: {
        OR: [{ id }, { leadId: id }],
      },
      include: {
        project: {
          include: {
            factSheet: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true },
        },
        visitBookings: {
          include: {
            slot: {
              include: {
                project: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        chatSessions: {
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.status && { status: body.status }),
        ...(body.wants !== undefined && { wants: body.wants }),
        ...(body.budget !== undefined && { budget: body.budget }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
        ...(body.projectId !== undefined && { projectId: body.projectId }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
