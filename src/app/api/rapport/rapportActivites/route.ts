import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_utilisateur, date } = body


    interface TravailParVehiculeParMois {
      code_vehicule: string;
      id_rapport_intervention: string;
      duree_travaux: string;
      description: string | null;
      PDR_consommee: string | null;
      reference_bc_bm_btm: string | null;
      cout: number | null;
      cout_main: number;
      nom_district : string ;
      designation : string ;
      nature_travaux : string ;
    }

    const rapport_activite = await prisma.$queryRawUnsafe<TravailParVehiculeParMois[]>(`
      exec PS_GET_TRAVAUX_PAR_VEHICULE_PAR_MOIS @id_utilisateur = ${id_utilisateur}, @mois_annee = '${date}' ;
    `)

    console.log("rapport_activite", rapport_activite);

    return NextResponse.json({ rapport_activite })
  } catch (error) {
    console.error("Erreur hors la recuperation des rapport:", error)
    return NextResponse.json({ error: "Failed to fetch rapport" }, { status: 500 })
  }
}






