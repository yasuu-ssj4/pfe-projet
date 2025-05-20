import { NextResponse } from "next/server"
import { ajouterTravauxInterne, ajouterTravauxExterne } from "@/app/prisma"
import { TraveauxExterne, TraveauxInterne } from "@/app/interfaces"

export async function POST(request: Request) {
  try {

   
     const body = await request.json()
    

    console.log("Body de la requête:", body)

    const { id_rapport, travauxInternes, travauxExternes } = body

    if (!id_rapport) {
      return NextResponse.json({ error: "ID du rapport est requis" }, { status: 400 })
    }

    const resultatsInternes = []
    const resultatsExternes = []

    if (travauxInternes && travauxInternes.length > 0) {
      for (const travail of travauxInternes) {
        const travailInterne: TraveauxInterne = {
          id_rapport: id_rapport,
          atelier_desc: travail.atelier_desc || travail.atelier,
          PDR_consommee: travail.pdr_consommee || travail.pdr_consomme,
          cout_pdr: Number.parseFloat(travail.cout.toString()),
          reference_bc_bm_btm: travail.reference,
          temps_alloue: Number.parseFloat(travail.temps_alloue.toString()),
          description   : travail.description,
        }

        try {
          const resultat = await ajouterTravauxInterne(travailInterne)
          resultatsInternes.push(resultat)
        } catch (error) {
          console.error("Erreur lors de l'ajout d'un travail interne:", error)
        }
      }
    }

    if (travauxExternes && travauxExternes.length > 0) {
      for (const travail of travauxExternes) {
        const travailExterne: TraveauxExterne = {
          id_rapport: id_rapport,
          design_prestataire: travail.prestataire,
          reference_contrat: travail.reference_contrat,
          reference_facture: travail.reference_facture,
          cout_facture: Number.parseFloat(travail.cout.toString()),
          description: travail.description,
        }

        try {
          const resultat = await ajouterTravauxExterne(travailExterne)
          resultatsExternes.push(resultat)
        } catch (error) {
          console.error("Erreur lors de l'ajout d'un travail externe:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Travaux ajoutés avec succès",
      resultatsInternes,
      resultatsExternes,
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout des travaux:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout des travaux", details: error }, { status: 500 })
  }
}
