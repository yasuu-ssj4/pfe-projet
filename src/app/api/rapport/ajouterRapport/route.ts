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
          data : {etat_demande : "complété"}
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
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_demande_intervention } = body;


    if (!id_demande_intervention) {
      return NextResponse.json(
        { message: "ID de rapport d'intervention manquant" },
        { status: 400 }
      );
    }
const rapport = await prisma.rapport_intervention.findUnique({
  where: { id_demande_intervention },
  select: { id_rapport_intervention: true },
});

if (!rapport) {
  return NextResponse.json({ message: "Rapport introuvable" }, { status: 404 });
}

const id_rapport = rapport.id_rapport_intervention;

await prisma.traveaux_interne.deleteMany({
  where: { id_rapport },
});
await prisma.traveaux_externe.deleteMany({
  where: { id_rapport },
});
    await prisma.demande_intervention.update({
      where: { id_demande_intervention },
      data: { etat_demande: "En instance" },
    });
       await prisma.rapport_intervention.delete({
      where: { id_demande_intervention },
    });
    

    return NextResponse.json({ message: "Rapport supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/...", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}