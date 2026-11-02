import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLeadId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const projectId = searchParams.get("projectId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { leadId: { contains: search } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (source && source !== "ALL") {
      where.source = source;
    }

    if (projectId && projectId !== "ALL") {
      where.projectId = projectId;
    }

    const total = await prisma.lead.count({ where });

    const leads = await prisma.lead.findMany({
      where,
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true },
        },
        visitBookings: {
          include: {
            slot: true,
          },
        },
        chatSessions: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, source, projectId, wants, budget, language } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Clean phone number (strip whitespace, dashes)
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Duplicate Check: exact phone or exact email
    const existingDuplicate = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(email ? [{ email }] : []),
        ],
      },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    let leadId = generateLeadId();
    // Ensure unique leadId
    while (await prisma.lead.findUnique({ where: { leadId } })) {
      leadId = generateLeadId();
    }

    const isDuplicate = !!existingDuplicate;

    const newLead = await prisma.lead.create({
      data: {
        leadId,
        name,
        phone: cleanPhone,
        email: email || null,
        source: source || "website",
        projectId: projectId || null,
        wants: wants || null,
        budget: budget || null,
        status: isDuplicate ? "DUPLICATE" : "NEW",
        isDuplicate,
        duplicateOfId: existingDuplicate ? existingDuplicate.id : null,
        consentGiven: true,
        language: language || "en",
      },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      duplicateWarning: isDuplicate
        ? {
            originalLeadId: existingDuplicate.leadId,
            originalName: existingDuplicate.name,
            originalCreatedAt: existingDuplicate.createdAt,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}

