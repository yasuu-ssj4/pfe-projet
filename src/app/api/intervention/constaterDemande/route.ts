import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
const body = await req.json();
const { id_demande_intervention } = body;
  if (!id_demande_intervention) {
    return new NextResponse('Paramètre "id_demande_intervention" manquant', { status: 400 });
  }

  try {
    const demande = await prisma.demande_intervention.findFirst({
      where: {
        id_demande_intervention: Number(id_demande_intervention)
      }
    });

    if (!demande) {
      return new NextResponse('Demande non trouvée', { status: 404 });
    }

    return NextResponse.json(demande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande :', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}