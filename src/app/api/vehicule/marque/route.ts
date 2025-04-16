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