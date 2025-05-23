import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()
export async function POST(req : NextRequest) {
    const { id_utilisateur } = await req.json();
       interface RapportIntervention {
          id_demande_intervention : number;
          id_rapport_intervention : string;
          date_application : Date;
          cout_total_traveaux_interne : number;
          cout_total_traveaux_externe : number;
            code_vehicule : string;
            numero_demande : string;
       }
    const result: RapportIntervention[] = await prisma.$queryRawUnsafe(`exec PS_GET_ALL_VEHICULES_RAPPORTS_PAR_UTILISATEUR @id_utilisateur = '${id_utilisateur}'`);
    return NextResponse.json(result);
}