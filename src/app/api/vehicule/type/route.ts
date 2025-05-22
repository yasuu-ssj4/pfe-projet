
import { Type } from "@/app/interfaces";
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { ajouterType } from "@/app/prisma";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body  = await req.json();
  const { designation , id_marque , type  } = body;
  const parsedId = parseInt(id_marque); // 🛠 convertit en nombre

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: "id_marque invalide" }, { status: 400 });
  };
if(type =="get"){
  const marque = await prisma.marque.findFirst({
    where: { id_marque: parsedId }
  });

  if (!marque) {
    return NextResponse.json({ error: "Marque not found" }, { status: 404 });
  }

  const types = await prisma.type.findMany({
    where: { id_marque: marque.id_marque },
  });

  return NextResponse.json(types, { status: 200 });
}
else if (type == "ajouter") {
const NvType : Type = {designation , id_marque}
 try {
         const typeExists = await prisma.marque.findFirst({
        where: { designation }, 
         });
         if (typeExists){
            return NextResponse.json(
                { error: 'type déjà existant' },
                { status: 400 }
            );
         }
         await ajouterType(NvType) ;
         return NextResponse.json({'type ajoutée avec succès' : designation}, { status: 200 });

    }catch (error) {
        console.error('Error in POST /api/vehicule/type', error);
        return NextResponse.json(
        { error: 'Erreur interne de serveur' },
        { status: 500 }
        );
    }
}
}
export async function PUT(req: Request) {
  const body = await req.json();
  const { id_type, nouvelleDesignation } = body;

  if (!id_type || !nouvelleDesignation) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    const updated = await prisma.type.update({
      where: { id_type: Number(id_type) },
      data: { designation: nouvelleDesignation },
    });

    return NextResponse.json({ message: "Désignation modifiée avec succès", updated }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type:", error);
    return NextResponse.json({ error: "Erreur interne de serveur" }, { status: 500 });
  }
}