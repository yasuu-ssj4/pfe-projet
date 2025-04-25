import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"
import { ajouterDemandeIntervention } from '@/app/prisma';


const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const demandeData = await req.json()

    // Validate required fields
    if (!demandeData.code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    // Get the service maintenance code based on the structure code
    const vehiculeInfo = await prisma.vehicule.findFirst({
      where: { code_vehicule: demandeData.code_vehicule },
      include: {
        affectations: {
          orderBy: { date: "desc" },
          take: 1,
          include: {
            structure: true,
          },
        },
      },
    })

    if (!vehiculeInfo || vehiculeInfo.affectations.length === 0) {
      return NextResponse.json({ error: "Véhicule ou structure non trouvé" }, { status: 404 })
    }

    const structureCode = vehiculeInfo.affectations[0].code_structure
    const serviceMaintenance = structureCode + "2" // Add 2 to the structure code for service maintenance

    // Create the demande
    const newDemande = await ajouterDemandeIntervention(demandeData)
    // Send notifications to service maintenance users
    await sendNotificationsToServiceMaintenance(serviceMaintenance, demandeData.id_demande_intervention, demandeData.code_vehicule)

    return NextResponse.json(newDemande, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/intervention/ajouterDemande", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

async function sendNotificationsToServiceMaintenance(
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
          contains: "ajouter_QI",
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
        VALUES (${user.id_utilisateur}, ${"Nouvelle demande d'intervention pour le véhicule " + code_vehicule}, ${
          "/vehicule/intervention/completer?id=" + id_demande_intervention
        }, ${false}, ${new Date()})
      `

      // Send email notification (this would be implemented with an email service)
      if (user.email) {
        console.log(`Email would be sent to ${user.email} about new demande ${id_demande_intervention}`)
        // Implementation of email sending would go here
      }
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
