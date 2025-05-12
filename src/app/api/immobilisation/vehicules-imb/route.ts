import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Get vehicles with IMB status for a specific user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    interface vehiculesImmobilises {
      code_structure: string
      code_vehicule: string
      date_immobilisation: Date
    }
  
    const immobilizedVehicles = await prisma.$queryRawUnsafe<vehiculesImmobilises[]>(`
     PS_GET_ALL_IMB_VEHICULES_INFOS_PAR_UTILISATEUR @id_utilisateur = ${userId}
    `)




    return NextResponse.json({ immobilizedVehicles })
  } catch (error) {
    console.error("Error fetching immobilized vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch immobilized vehicles" }, { status: 500 })
  }
}
