import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.factSheetEntry.update({
      where: { id },
      data: {
        ...(body.question && { question: body.question }),
        ...(body.answer && { answer: body.answer }),
        ...(body.category && { category: body.category }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating fact sheet entry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update entry" },
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

    await prisma.factSheetEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting fact sheet entry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete entry" },
      { status: 500 }
    );
  }
}
