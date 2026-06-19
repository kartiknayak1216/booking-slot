import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { slot: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

  await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } }),
    prisma.slot.update({ where: { id: booking.slotId }, data: { isBooked: false } }),
  ]);

  return NextResponse.json({ success: true });
}
