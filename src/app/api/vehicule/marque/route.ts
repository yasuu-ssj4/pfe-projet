import { Marque } from "@/app/interfaces";
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { ajouterMarque } from "@/app/prisma";

const prisma = new PrismaClient();
export async function GET() {
  try {
    const marques = await prisma.marque.findMany({
      select: {
        id_marque: true,
        designation: true,
      },
    });
    return NextResponse.json(marques, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/marque", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}
export async function POST(req : NextRequest) {
const NvMarque : Marque = await req.json() ; 
const { designation } = NvMarque ;
    try {
         const marqueExists = await prisma.marque.findFirst({
        where: { designation }, 
         });
         if (marqueExists){
            return NextResponse.json(
                { error: 'marque déjà existant' },
                { status: 400 }
            );
         }
         await ajouterMarque(NvMarque) ;
         return NextResponse.json({'marque ajoutée avec succès' : designation}, { status: 200 });

    }catch (error) {
        console.error('Error in POST /api/vehicule/marque', error);
        return NextResponse.json(
        { error: 'Erreur interne de serveur' },
        { status: 500 }
        );
    }
}
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id_marque, nouvelleDesignation } = body;

  if (!id_marque || !nouvelleDesignation) {
    return NextResponse.json(
      { error: "Champs manquants (id_marque ou nouvelleDesignation)" },
      { status: 400 }
    );
  }

  try {
    const updatedMarque = await prisma.marque.update({
      where: { id_marque: Number(id_marque) },
      data: { designation: nouvelleDesignation },
    });

    return NextResponse.json(
      { message: "Marque mise à jour avec succès", updatedMarque },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans PUT /api/marque :", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}