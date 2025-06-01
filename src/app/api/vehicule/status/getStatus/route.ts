import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { code_vehicule } = await req.json()

    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    // Get the latest status for the vehicle
    const latestStatus = await prisma.historique_status.findFirst({
      where: { code_vehicule },
      orderBy: { date: "desc" },
      select: { code_status: true },
    })

    if (!latestStatus) {
      return NextResponse.json({ error: "Aucun statut trouvé pour ce véhicule" }, { status: 404 })
    }

    return NextResponse.json({ code_status: latestStatus.code_status }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/vehicule/status/getStatus:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
