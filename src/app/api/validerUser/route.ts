import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, code_structure } = await req.json();

  try {
    const Userexistance = await prisma.utilisateur.findUnique({
      where: { username },
    });

    if (Userexistance) {
      return new Response(JSON.stringify({ error: "Nom d'utilisateur déjà pris." }), { status: 400 });
    }

    const structureExists = await prisma.structure.findUnique({
      where: { code_structure },
    });

    if (!structureExists) {
      return new Response(JSON.stringify({ error: "Code structure invalide." }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Validation réussie." }), { status: 200 });

  } catch (error) {
    console.error("Erreur de validation:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur pendant la validation." }), { status: 500 });
  }
}
