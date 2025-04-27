import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest) {
  try {
    const { id_utilisateur } = await req.json()

    if (!id_utilisateur) {
      return NextResponse.json({ error: "L'ID de l'utilisateur est requis" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(id_utilisateur) },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Delete user
    await prisma.utilisateur.delete({
      where: { id_utilisateur: Number(id_utilisateur) },
    })

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/utilisateur/deleteUser", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
