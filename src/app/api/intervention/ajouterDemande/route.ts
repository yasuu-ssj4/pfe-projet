import { ajouterDemandeIntervention } from "@/app/prisma"
import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

import { sendInterventionNotification } from "@/app/lib/mail"
import { Utilisateur } from '../../../interfaces';

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type")
    console.log("Content-Type:", contentType)

    const bodyText = await req.text()
    console.log("Raw Body:", bodyText)

    const demandeData = JSON.parse(bodyText)
    console.log("Parsed Body:", demandeData)
    

    if (!demandeData.code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }


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
    const serviceMaintenance = structureCode + "2" 
    const UtilisateurAEnvoyer =await prisma.utilisateur.findMany({
      where : {
        code_structure : serviceMaintenance,
      },
      select: {
        email: true,
        droit_utilisateur: true,
      }

    })
      UtilisateurAEnvoyer.forEach((user) => {
        if (user.droit_utilisateur || user.droit_utilisateur.includes("ajouter_rapport")|| user.droit_utilisateur.includes("ajouter_QI")) {
          sendInterventionNotification(user.email, demandeData.id_demande_intervention, demandeData.code_vehicule)
        }
      })
    // Create the demande
     await ajouterDemandeIntervention(demandeData)
      return NextResponse.json({success : true}, {status : 200})

  } catch (error) {
    console.error("Error in POST /api/intervention/ajouterDemande", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_demande_intervention } = body;


    if (!id_demande_intervention) {
      return NextResponse.json(
        { message: "ID de demande d'intervention manquant" },
        { status: 400 }
      );
    }
   await prisma.demande_intervention.delete({
      where: { id_demande_intervention: Number(id_demande_intervention) },

   });

    return NextResponse.json({ message: "Demande supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/...", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}