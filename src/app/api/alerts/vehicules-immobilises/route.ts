import { NextResponse , NextRequest} from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
type Vehiculetype = {
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
export async function POST(request : NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Get all vehicles for this user
    const vehicles: Vehiculetype[] = await prisma.$queryRawUnsafe(`
      EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${userId}
    `)

     
    const immobilisedCount = vehicles.filter((v) => v.status_designation === "Immobilisé").length
     
    return NextResponse.json({ count: immobilisedCount })
  } catch (error) {
    console.error("Error fetching vehicules immobilisés count:", error)
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 })
  }
}
