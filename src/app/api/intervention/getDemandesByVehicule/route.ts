import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { code_vehicule } = await req.json()

    if (!code_vehicule) {
      return NextResponse.json({ error: "Code véhicule requis" }, { status: 400 })
    }

    const demandes = await prisma.demande_intervention.findMany({
      where: {
        code_vehicule: code_vehicule,
      },
      orderBy: {
        date_application: "desc",
      },
    })

    return NextResponse.json(demandes, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/intervention/getDemandesByVehicule", error)
    return NextResponse.json({ error: "Erreur interne de serveur" }, { status: 500 })
  }
}
