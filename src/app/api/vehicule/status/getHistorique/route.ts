import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { HistoriqueStatus } from '../../../../interfaces';
const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { code_vehicule } = await request.json()

    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    interface HistoriqueStatus {
      code_vehicule: string
        code_status: string
        date: Date
    }

    const result : HistoriqueStatus[] = await prisma.historique_status.findMany({
      where: { code_vehicule },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching status history:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'historique des statuts" }, { status: 500 })
  }
}
