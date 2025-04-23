
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Utilisateur } from "@/app/interfaces";
import { ajouterUtilisateur } from "@/app/prisma";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user : Utilisateur= await req.json();

  try {
    await ajouterUtilisateur(user)

    return new Response(JSON.stringify({ message: "Utilisateur créé avec succès", user: user }), { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur pendant la création." }), { status: 500 });
  }
}