import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { code_vehicule } = await req.json()

    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    // Get the latest affectation for the vehicle
    const latestAffectation = await prisma.affectation.findFirst({
      where: { code_vehicule },
      orderBy: { date: "desc" },
      select: { code_structure: true },
    })

    if (!latestAffectation) {
      return NextResponse.json({ error: "Aucune affectation trouvée pour ce véhicule" }, { status: 404 })
    }

    return NextResponse.json({ code_structure: latestAffectation.code_structure }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/vehicule/affectation/getAffectation:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
