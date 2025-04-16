import { Genre } from "@/app/interfaces";
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { ajouterGenre } from "@/app/prisma";

const prisma = new PrismaClient();
export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      select: {
        code_genre: true,
        designation: true,
      },
    });
    return NextResponse.json(genres, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/genre", error);
    return NextResponse.json(
      { error: "Erreur interne de serveur" },
      { status: 500 }
    );
  }
}
export async function POST(req : NextRequest) {
  const NvGenre: Genre = await req.json();
  const { code_genre , designation  } = NvGenre;
  try {
    const genreExists = await prisma.genre.findFirst({
      where: { designation , code_genre },
    });
    if (genreExists) {
      return NextResponse.json(
        { error: 'genre déjà existant' },
        { status: 400 }
      );
    }
    await ajouterGenre(NvGenre);
    return NextResponse.json({ 'genre ajouté avec succès': designation }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/vehicule/genre', error);
    return NextResponse.json(
      { error: 'Erreur interne de serveur' },
      { status: 500 }
    );
  }
}