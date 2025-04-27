import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { id_demande_intervention, constat_panne, diagnostique, id_intervevant } = await req.json()

    if (!id_demande_intervention) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }

    // Check if the demande exists
    const demande = await prisma.demande_intervention.findUnique({
      where: {
        id_demande_intervention: id_demande_intervention,
      },
    })

    if (!demande) {
      return NextResponse.json({ error: "Demande d'intervention non trouvée" }, { status: 404 })
    }

    // Update the demande with the constat information
    const updatedDemande = await prisma.demande_intervention.update({
      where: {
        id_demande_intervention: id_demande_intervention,
      },
      data: {
        constat_panne: constat_panne || demande.constat_panne,
        diagnostique: diagnostique || demande.diagnostique,
        id_intervevant: id_intervevant || demande.id_intervevant,
        date_intervevant: new Date(),
      },
    })

    return NextResponse.json(updatedDemande, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/intervention/constaterDemande", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
