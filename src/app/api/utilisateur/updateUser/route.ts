import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import type { Utilisateur } from "@/app/interfaces"
import CryptoJS from "crypto-js"
import { SECRET_KEY } from "@/app/prisma"

const prisma = new PrismaClient()

export async function PUT(req: NextRequest) {
  try {
    const userData = await req.json()
    console.log("userData", userData);
    
    if (!userData.id_utilisateur) {
      return NextResponse.json({ error: "L'ID de l'utilisateur est requis" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: userData.id_utilisateur },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      nom_utilisateur: userData.nom_utilisateur,
      prenom_utilisateur: userData.prenom_utilisateur,
      email: userData.email,
      numero_telephone: userData.numero_telephone,
      code_structure: userData.code_structure,
      methode_authent: userData.methode_authent,
      est_admin: userData.est_admin,
      droit_utilisateur: userData.droit_utilisateur,
      role: userData.role,
    }

    // Only update password if provided
    if (userData.mot_de_passe && userData.mot_de_passe.trim() !== "") {
      updateData.mot_de_passe = CryptoJS.AES.encrypt(userData.mot_de_passe, SECRET_KEY).toString()
    }

    // Update user
    const updatedUser = await prisma.utilisateur.update({
      where: { id_utilisateur: userData.id_utilisateur },
      data: updateData,
    })

    return NextResponse.json({ message: "Utilisateur mis à jour avec succès", user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/utilisateur/updateUser", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
