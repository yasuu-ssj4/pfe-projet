import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    interface ImmobilisationH {
      code_district: string
      designation_district: string
      code_centre: string
      designation_centre: string
      code_vehicule: string
      date_immobilisation: Date
      cause: string
      lieu: string
      action: string
      echeance: Date
    }

    const immobilizedVehicles = await prisma.$queryRawUnsafe<ImmobilisationH[]>(`
     PS_GET_IMMOBILISATIONS_HISTORIQUE @id_utilisateur = ${userId}
    `)



     console.log("immobilizedVehicles", immobilizedVehicles);
     
    return NextResponse.json({ immobilizedVehicles })
  } catch (error) {
    console.error("Error fetching immobilized vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch immobilized vehicles" }, { status: 500 })
  }
}
