import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const {
      id_demande_intervention,
      constat_panne,
      diagnostique,
      niveaux_prio,
      necess_permis,
      routinier,
      routinier_ref,
      dangereux,
      dangereux_ref,
      nom_prenom_responsable,
      fonction_responsable,
    } = await req.json()
    
    if (!id_demande_intervention) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }

    // Check if the demande exists and is in qualification state
    const demande = await prisma.demande_intervention.findUnique({
      where: {
        id_demande_intervention: id_demande_intervention,
      },
    })

    if (!demande) {
      return NextResponse.json({ error: "Demande d'intervention non trouvée" }, { status: 404 })
    }

    if (demande.etat_demande !== "En instance") {
      return NextResponse.json({ error: "La demande n'est pas en état de qualification" }, { status: 400 })
    }

    // Update the demande with the completion information
    const updatedDemande = await prisma.demande_intervention.update({
      where: {
        id_demande_intervention: id_demande_intervention,
      },
      data: {
        etat_demande: "rapport",
        constat_panne: constat_panne || demande.constat_panne,
        diagnostique: diagnostique || demande.diagnostique,
        niveaux_prio: niveaux_prio || demande.niveaux_prio,
        necess_permis: necess_permis !== undefined ? necess_permis : demande.necess_permis,
        routinier: routinier !== undefined ? routinier : demande.routinier,
        routinier_ref: routinier_ref || demande.routinier_ref,
        dangereux: dangereux !== undefined ? dangereux : demande.dangereux,
        dangereux_ref: dangereux_ref || demande.dangereux_ref,
        nom_prenom_responsable: nom_prenom_responsable || demande.nom_prenom_responsable,
        date_responsable: new Date().toISOString(),
        fonction_responsable: fonction_responsable || demande.fonction_responsable,
      },
    })

    // Send notifications to users with ajouter_rapport privilege
   

    return NextResponse.json(updatedDemande, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/intervention/completerDemande", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

async function sendNotificationsToMaintenanceUsers(
  serviceMaintenance: string,
  id_demande_intervention: string,
  code_vehicule: string,
) {
  try {
    // Find users in the service maintenance structure with appropriate privileges
    const users = await prisma.utilisateur.findMany({
      where: {
        code_structure: serviceMaintenance,
        droit_utilisateur: {
          contains: "ajouter_rapport",
        },
      },
      select: {
        id_utilisateur: true,
        email: true,
      },
    })

    // Create notifications for each user
    for (const user of users) {
      await prisma.$executeRaw`
        INSERT INTO notifications (id_utilisateur, message, link, is_read, created_at)
        VALUES (${user.id_utilisateur}, ${"Demande d'intervention à compléter pour le véhicule " + code_vehicule}, ${
          "/vehicule/intervention/rapport?id_demande_intervention=" + id_demande_intervention
        }, ${false}, ${new Date()})
      `

      // Send email notification (this would be implemented with an email service)
      if (user.email) {
        console.log(`Email would be sent to ${user.email} about demande to complete ${id_demande_intervention}`)
        // Implementation of email sending would go here
      }
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
