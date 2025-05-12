
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function POST(req: NextRequest) {
  const body = await req.json()
  const id_utilisateur = body.id_utilisateur

  const results = await prisma.$queryRawUnsafe(`
    EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${id_utilisateur}
  `)

  return NextResponse.json(results)
}
