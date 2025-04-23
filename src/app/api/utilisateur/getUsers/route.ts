// Example for /app/api/getVehicules/route.ts (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function POST(req: NextRequest) {
  const body = await req.json()
  const id_utilisateur = body.id_utilisateur

  const results = await prisma.$queryRawUnsafe(`
    PS_GET_UTILISATEURS_PAR_STRUCTURE ${id_utilisateur}
  `)

  return NextResponse.json(results)
}
