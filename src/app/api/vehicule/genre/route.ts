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
