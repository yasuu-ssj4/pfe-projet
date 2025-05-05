import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()
export async function POST(req : NextRequest) {
    const { code_vehicule } = await req.json();
   

const result: any[] = await prisma.$queryRawUnsafe(`PS_GET_DERNIERE_DATE_VEHICULE '${code_vehicule}'`);
    return NextResponse.json(result);
}