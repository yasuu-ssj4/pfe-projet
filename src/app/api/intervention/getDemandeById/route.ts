import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { id_demande_intervention } = await req.json()

    if (!id_demande_intervention) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }

    const demande = await prisma.demande_intervention.findUnique({
      where: {
        id_demande_intervention: id_demande_intervention,
      },
    })

    if (!demande) {
      return NextResponse.json({ error: "Demande d'intervention non trouvée" }, { status: 404 })
    }

    return NextResponse.json(demande, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/intervention/getDemandeById", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
