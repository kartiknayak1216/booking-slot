import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await prisma.slot.findMany({
    where: { providerId: session.userId },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ slots });
}
