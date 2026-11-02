import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const executives = await prisma.user.findMany({
      where: {
        role: { in: ["SALES_EXEC", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        _count: {
          select: {
            assignedLeads: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: executives });
  } catch (error: any) {
    console.error("Error fetching executives:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch executives" },
      { status: 500 }
    );
  }
}

