import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        factSheet: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            leads: true,
            visitSlots: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
