import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    include: {
      slot: {
        include: {
          provider: { select: { id: true, name: true, timezone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slotId } = await req.json();
  if (!slotId) return NextResponse.json({ error: "Missing slotId" }, { status: 400 });

  // Atomic check + book to prevent double booking
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  if (slot.isBooked) return NextResponse.json({ error: "Slot already booked" }, { status: 409 });

  // Transaction: mark slot booked + create booking
  const booking = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const updated = await tx.slot.updateMany({
      where: { id: slotId, isBooked: false }, // optimistic lock
      data: { isBooked: true },
    });

    if (updated.count === 0) {
      throw new Error("Slot was just booked by someone else");
    }

    return tx.booking.create({
      data: { userId: session.userId, slotId },
      include: { slot: true },
    });
  });

  return NextResponse.json({ booking }, { status: 201 });
}


