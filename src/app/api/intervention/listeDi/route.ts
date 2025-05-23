import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()
export async function POST(req : NextRequest) {
    const { id_utilisateur } = await req.json();
       interface DemandeIntervention {
          numero_demande: string;
          etat_demande: string;
          nature_panne : string;
          nature_travaux : string;
          date_application : Date;
          degre_urgence : string;
            code_vehicule : string;
       }
    const result: DemandeIntervention[] = await prisma.$queryRawUnsafe(`exec PS_GET_ALL_VEHICULES_DEMANDES_PAR_UTILISATEUR @id_utilisateur = '${id_utilisateur}'`);
    return NextResponse.json(result);
}