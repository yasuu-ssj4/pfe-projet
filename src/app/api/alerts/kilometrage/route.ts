import { NextResponse , NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Get all vehicles for this user using the stored procedure
    const vehicles : Vehiculetype[] = await prisma.$queryRawUnsafe(`
      EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${userId}
    `)

    // Extract vehicle codes
    const vehicleCodes = vehicles.map((v) => v.code_vehicule)

    // Try to get pre-calculated alerts from file
    let alerts = []

    try {
      // Read from the file
      const filePath = path.join(process.cwd(), "alerts", "kilometrage-alerts.json")

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8")
        const allAlerts = JSON.parse(fileContent)

        // Filter alerts for this user's vehicles
        alerts = allAlerts.filter((alert: { code_vehicule: string }) => vehicleCodes.includes(alert.code_vehicule))
      } else {
        console.log("Alerts file not found, calculating on-demand")
        // If file doesn't exist, calculate alerts on-demand (fallback)
        alerts = await calculateKilometrageAlerts(vehicles)
      }
    } catch (fileError) {
      console.error("Error reading alerts file:", fileError)
      // Fallback to calculating alerts on-demand
      alerts = await calculateKilometrageAlerts(vehicles)
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching kilometrage alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// Fallback function to calculate alerts on-demand
async function calculateKilometrageAlerts(vehicles:Vehiculetype[]) {
  const alerts = []
  const today = new Date()

  for (const vehicle of vehicles) {
    // Process in batches to avoid overwhelming the database
    try {
      // Use Prisma to get the last kilometrage update
      const lastUpdate = await prisma.historique_kilometrage_heure.findFirst({
        where: {
          code_vehicule: vehicle.code_vehicule,
        },
        orderBy: {
          date: "desc",
        },
      })

      if (lastUpdate && lastUpdate.date) {
        const lastUpdateDate = new Date(lastUpdate.date)
        const diffTime = today.getTime() - lastUpdateDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays > 3) {
          alerts.push({
            code_vehicule: vehicle.code_vehicule,
            n_immatriculation: vehicle.n_immatriculation,
             marque_designation: vehicle.marque_designation,
            type_designation: vehicle.type_designation,
            derniere_mise_a_jour: lastUpdate.date,
            jours_depuis_maj: diffDays,
          })
        }
      } else {
        alerts.push({
          code_vehicule: vehicle.code_vehicule,
          n_immatriculation: vehicle.n_immatriculation,
          marque_designation: vehicle.marque_designation,
          type_designation: vehicle.type_designation,
          derniere_mise_a_jour: null,
          jours_depuis_maj: 999,
        })
      }
    } catch (error) {
      console.error(`Error processing vehicle ${vehicle.code_vehicule}:`, error)
    }
  }

  return alerts
}
