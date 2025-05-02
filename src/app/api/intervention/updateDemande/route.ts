import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id_demande_intervention,
      etat_demande,
      constat_panne,
      diagnostique,
      description,
      niveaux_prio,
      necess_permis,
      routinier,
      routinier_ref,
      dangereux,
      dangereux_ref,
      id_intervevant,
      date_intervevant,
      nom_prenom_responsable,
      date_responsable,
      fonction_responsable,
      date_responsable_unm,
      fonction_responsable_unm,
      nom_prenom_responsable_unm,
      date_hse,
      fonction_hse,
      nom_prenom_hse,
    } = body

    console.log("Updating demande:", id_demande_intervention)

    if (!id_demande_intervention) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }

    // Update only the nullable fields in the demande_intervention record
    const updatedDemande = await prisma.demande_intervention.update({
      where: { id_demande_intervention },
      data: {
        etat_demande, 
        constat_panne,
        diagnostique,
        description,
        niveaux_prio,
        necess_permis,
        routinier,
        routinier_ref,
        dangereux,
        dangereux_ref,
        id_intervevant,
        date_intervevant: date_intervevant ? new Date(date_intervevant) : null,
        nom_prenom_responsable,
        date_responsable,
        fonction_responsable,
        date_responsable_unm,
        fonction_responsable_unm,
        nom_prenom_responsable_unm,
        date_hse,
        fonction_hse,
        nom_prenom_hse,
      },
    })

    return NextResponse.json({ message: "Demande mise à jour avec succès", demande: updatedDemande }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/intervention/updateDemande", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
