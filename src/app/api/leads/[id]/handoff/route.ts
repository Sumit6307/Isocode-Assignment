import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { executiveId, notes } = body;

    if (!executiveId) {
      return NextResponse.json(
        { success: false, error: "Sales executive ID is required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        chatSessions: {
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        project: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    const executive = await prisma.user.findUnique({
      where: { id: executiveId },
    });

    if (!executive) {
      return NextResponse.json(
        { success: false, error: "Executive not found" },
        { status: 404 }
      );
    }

    // Generate intelligent chat summary from conversation history
    let summary = "";
    const activeSession = lead.chatSessions[0];

    if (activeSession && activeSession.messages.length > 0) {
      const userMsgs = activeSession.messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("; ");
      summary = `Buyer Enquiry Summary:\n- Project: ${lead.project?.name || "General inquiry"}\n- Requirements: ${lead.wants || "Not specified"}\n- Stated Budget: ${lead.budget || "Not disclosed"}\n- Key Questions/Interest: ${userMsgs.slice(0, 300)}...\n- Handoff Reason: Qualified buyer ready for direct assistance by ${executive.name}`;
    } else {
      summary = `Direct lead assignment to ${executive.name}. Requirements: ${lead.wants || "2/3 BHK"}, Budget: ${lead.budget || "₹65L - ₹1.2Cr"}.`;
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        assignedToId: executiveId,
        status: "HANDED_OFF",
        notes: notes ? `${lead.notes ? lead.notes + "\n" : ""}[Handoff Note]: ${notes}` : lead.notes,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true },
        },
        project: true,
      },
    });

    // Update chat session if exists
    if (activeSession) {
      await prisma.chatSession.update({
        where: { id: activeSession.id },
        data: {
          status: "HANDED_OFF",
          handoffExecId: executiveId,
          summary,
        },
      });

      // Insert system message about handoff
      await prisma.chatMessage.create({
        data: {
          sessionId: activeSession.id,
          role: "system",
          content: `Lead handed off to Sales Executive ${executive.name} (${executive.phone || executive.email}). All previous chat context has been transferred.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        lead: updatedLead,
        summary,
        assignedTo: executive.name,
      },
    });
  } catch (error: any) {
    console.error("Error in lead handoff:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to hand off lead" },
      { status: 500 }
    );
  }
}
