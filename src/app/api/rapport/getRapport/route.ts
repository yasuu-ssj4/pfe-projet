import { NextResponse,NextRequest  } from 'next/server';
import { PrismaClient  } from '@prisma/client';
import { RapportIntervention, TraveauxExterne, TraveauxInterne } from '@/app/interfaces';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
 const body = await req.json();
  const {id_demande_intervention} = body;

  if (!id_demande_intervention) {
    return new NextResponse('Paramètre "id_demande_intervention" manquant', { status: 400 });
  }

  try {
    const rapport  = await prisma.rapport_intervention.findUnique({
      where: {
        id_demande_intervention: Number(id_demande_intervention),
      },
    });
  const id_rapport_intervention = rapport?.id_rapport_intervention;
  const TravauxExterne : TraveauxExterne[] = await prisma.traveaux_externe.findMany({
      where: {
        id_rapport: id_rapport_intervention,
      },
    });
    const TravauxInterne : TraveauxInterne[] = await prisma.traveaux_interne.findMany({
      where: {
        id_rapport: id_rapport_intervention,
      },
    });

 
    return NextResponse.json({rapport, TravauxExterne, TravauxInterne}, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport :', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}