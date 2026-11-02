import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            project: true,
            assignedTo: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}
