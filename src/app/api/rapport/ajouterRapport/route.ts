import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { RapportIntervention } from "@/app/interfaces";
const prisma = new PrismaClient();
import { ajouterRapportIntervention } from "@/app/prisma";

export async function POST(req: NextRequest) {
try{
    const body  = await req.json();
      const RapportBody : RapportIntervention = body;
      console.log("Rapport:", RapportBody);
    
        const existance = await prisma.rapport_intervention.findUnique({
            where : {
                id_rapport_intervention : RapportBody.id_rapport_intervention
            } ,
            select : {
                id_rapport_intervention : true,
            }
        })


        if (existance) {
            return NextResponse.json({ message: "Rapport deja existe" }, { status: 400 });
        }
    


         const rapport = await ajouterRapportIntervention(RapportBody);
         await prisma.demande_intervention.update({
          where : {id_demande_intervention : RapportBody.id_demande_intervention},
          data : {etat_demande : "complet"}
         })
        return NextResponse.json({ succes: true }, { status: 201 });
}catch (error) {
    console.error("Error in POST /api/...", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}
