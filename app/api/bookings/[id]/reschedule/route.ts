import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { newSlotId } = await req.json();
  if (!newSlotId) return NextResponse.json({ error: "Missing newSlotId" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Booking is cancelled" }, { status: 400 });

  const newSlot = await prisma.slot.findUnique({ where: { id: newSlotId } });
  if (!newSlot || newSlot.isBooked) {
    return NextResponse.json({ error: "New slot not available" }, { status: 409 });
  }

  const updated = await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
    // Free old slot
    await tx.slot.update({ where: { id: booking.slotId }, data: { isBooked: false } });

    // Lock new slot
    const lockResult = await tx.slot.updateMany({
      where: { id: newSlotId, isBooked: false },
      data: { isBooked: true },
    });

    if (lockResult.count === 0) throw new Error("New slot just got taken");

    return tx.booking.update({
      where: { id },
      data: { slotId: newSlotId },
      include: { slot: true },
    });
  });

  return NextResponse.json({ booking: updated });
}
