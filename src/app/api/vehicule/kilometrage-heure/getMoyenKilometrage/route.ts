import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()
export async function POST(req : NextRequest) {
    const { id_utilisateur } = await req.json();
   interface result {
    code_vehicule: string;
    valeur_moy_kil : number
   }

const result: result[] = await prisma.$queryRawUnsafe(`PS_GET_MOYENNE_KILOMETRAGE_APRES_RAPPORT_PAR_UTILISATEUR '${id_utilisateur}'`);
    return NextResponse.json(result);
}