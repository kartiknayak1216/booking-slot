import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


//FLAG:PENDING

// GET /api/slots?page=1&date=2025-01-15&providerId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const date = searchParams.get("date");
  const providerId = searchParams.get("providerId");

  const where: Record<string, unknown> = { isBooked: false };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.startTime = { gte: start, lte: end };
  } else {
    // Only show future slots by default
    where.startTime = { gte: new Date() };
  }

  if (providerId) {
    where.providerId = providerId;
  }

  const [slots, total] = await Promise.all([
    prisma.slot.findMany({
      where,
      include: {
        provider: { select: { id: true, name: true, timezone: true } },
      },
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.slot.count({ where }),
  ]);

  return NextResponse.json({ slots, total, page, pages: Math.ceil(total / limit) });
}


export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { startTime, endTime } = await req.json();
  if (!startTime || !endTime) {
    return NextResponse.json({ error: "Missing startTime or endTime" }, { status: 400 });
  }

  const slot = await prisma.slot.create({
    data: {
      providerId: session.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return NextResponse.json({ slot }, { status: 201 });
}