import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id_demande } = body
    console.log("id_demande received:", id_demande)
      
    if (!id_demande) {
      return NextResponse.json({ error: "L'ID de la demande d'intervention est requis" }, { status: 400 })
    }
    
    const demandeInfos = await prisma.demande_intervention.findUnique({
      where: { id_demande_intervention: Number(id_demande) },
      select: {
        numero_demande: true,
        date_application: true,
        date_heure_panne: true,  
        structure_maintenance: true,
        activite: true,
        nature_panne: true,
        nature_travaux: true,
        degre_urgence: true,
        code_vehicule: true,
        district_id: true,
        centre_id: true,
        constat_panne: true,
        nom_prenom_demandeur: true,
        fonction_demandeur: true,
        date_demandeur: true
      }
    })
    console.log("Demande Infos:", demandeInfos)
    
    if (!demandeInfos) {
      return NextResponse.json({ error: "Demande d'intervention non trouvée" }, { status: 404 })
    }
    
    return NextResponse.json(demandeInfos, { status: 200 })
  
  } catch (error) {
    console.error("Error in POST /api/intervention/getDemandeById", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
