import { PrismaClient } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { code_vehicule } = await req.json()
   console.log(code_vehicule);
   
    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    // Get vehicle info with type and marque
    const vehicule = await prisma.vehicule.findUnique({
      where: {
        code_vehicule: code_vehicule,
      },
      select: {
        code_vehicule: true,
        
        FK_vehicule_REF_genre : {
          select: { 
            designation: true,
          },
        },
        FK_vehicule_REF_type: {
          select: {
            designation: true,
            FK_type_REF_marque: {
              select: {
                designation: true,
              },
            },
          },
        },
      },
    })
     
    if (!vehicule) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 })
    } 
   type desigs = {
    designation_centre : string ;
    designation_district : string
   }
   const result: any[] = await prisma.$queryRawUnsafe(`EXEC PS_GET_DESIGNATION_STRUCT_STRUCT_HIERACHIQUE '${code_vehicule}'`)
   const { structure_designation, parent_designation } = result[0]
   const totalKiometrage = await prisma.historique_kilometrage_heure.aggregate({
    where: {
      code_vehicule: code_vehicule,
    },
    _sum: {
      kilo_parcouru_heure_fonctionnement: true,
    },
  })


  const vehiculeInfo = {
      code_vehicule: vehicule.code_vehicule,
      genre_designation: vehicule.FK_vehicule_REF_genre.designation,
      totalKilo : totalKiometrage._sum.kilo_parcouru_heure_fonctionnement?.toString() ,
      type_designation: vehicule.FK_vehicule_REF_type.designation,
      marque_designation: vehicule.FK_vehicule_REF_type.FK_type_REF_marque.designation,
      designation_centre : structure_designation ,
      designation_district : parent_designation
    }
  console.log(vehiculeInfo);
  
    return NextResponse.json(vehiculeInfo, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/vehicule/getVehiculeInfo", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
