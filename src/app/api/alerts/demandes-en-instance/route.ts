import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type VehiculeType = {
  code_vehicule: string
  n_immatriculation: string
  code_structure: string
  type_designation: string
  marque_designation: string
  status_designation: string | null
  total_kilometrage: number
  derniere_mise_a_jour?: string
  besoin_mise_a_jour?: boolean
}

// Define the type for the SQL count result
type CountResult = {
  count: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Get all vehicles for this user
    const vehicles: VehiculeType[] = await prisma.$queryRawUnsafe(`
      EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${userId}
    `)

    const vehicleCodes = vehicles.map((v) => v.code_vehicule)


    const vehicleCodesStr = vehicleCodes.length > 0 ? vehicleCodes.map((code) => `'${code}'`).join(",") : "''"
 
    // Count demandes with "En instance" status for these vehicles
    let count = 0

    if (vehicleCodes.length > 0) {
      const result = await prisma.$queryRawUnsafe<CountResult[]>(`
        SELECT COUNT(*) as count FROM demande_intervention 
        WHERE code_vehicule IN (${vehicleCodesStr})
        AND etat_demande = 'En instance'
      `)
    
    
      if (Array.isArray(result) && result.length > 0 && result[0]?.count != null) {
        count = result[0].count
      } else {
        console.warn("No count returned or bad format:", result)
      }
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching demandes en instance count:", error)
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 })
  }
}
