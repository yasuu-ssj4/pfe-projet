
import { Type } from "@/app/interfaces";
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { ajouterType } from "@/app/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body  = await req.json();
  const { designation , id_marque , type  } = body;
if(type =="get"){
  const marque = await prisma.marque.findFirst({
    where: { id_marque }
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
