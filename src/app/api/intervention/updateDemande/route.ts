import { PrismaClient } from "@prisma/client"
import { log } from "console"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Received body:", body)
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
      nom_prenom_intervevant,
      fonction_intervevant,
      date_intervevant = new Date(),
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

    console.log("Updating demande:",body)
    console.log(typeof(date_intervevant));
    
    if (!id_demande_intervention) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }


     await prisma.demande_intervention.update({
      where: { id_demande_intervention : Number(id_demande_intervention) },
      data: {
        etat_demande, 
        constat_panne,
        diagnostique,
        description,
        niveaux_prio  : parseInt(niveaux_prio) ,
        necess_permis,
        routinier,
        routinier_ref,
        dangereux,
        dangereux_ref,
        nom_prenom_intervevant : nom_prenom_intervevant,
        fonction_intervevant : fonction_intervevant,
        date_intervevant : date_intervevant ? new Date(date_intervevant) : null,
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

    return NextResponse.json({ message: "Demande mise à jour avec succès",  }, { status: 200 })
  } catch (error) {
    
    
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
