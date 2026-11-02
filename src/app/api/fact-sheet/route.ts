import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");

    const where: any = {};
    if (projectId && projectId !== "ALL") where.projectId = projectId;
    if (category && category !== "ALL") where.category = category;

    const entries = await prisma.factSheetEntry.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, reraNumber: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    console.error("Error fetching fact sheet:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch fact sheet" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, question, answer, category, sortOrder } = body;

    if (!projectId || !question || !answer) {
      return NextResponse.json(
        { success: false, error: "Project, question, and answer are required" },
        { status: 400 }
      );
    }

    const newEntry = await prisma.factSheetEntry.create({
      data: {
        projectId,
        question,
        answer,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: true,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error: any) {
    console.error("Error creating fact sheet entry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create entry" },
      { status: 500 }
    );
  }
}

