
import { Type } from "@/app/interfaces";
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { ajouterType } from "@/app/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { designation } = body;

  const marque = await prisma.marque.findFirst({
    where: { designation },
  });

  if (!marque) {
    return NextResponse.json({ error: "Marque not found" }, { status: 404 });
  }

  const types = await prisma.type.findMany({
    where: { id_marque: marque.id_marque },
  });

  return NextResponse.json(types);
}
