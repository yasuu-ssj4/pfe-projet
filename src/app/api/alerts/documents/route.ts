import { NextResponse, type NextRequest } from "next/server"
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
    const vehicles: Vehiculetype[] = await prisma.$queryRawUnsafe(`
      EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${userId}
    `)

    // Extract vehicle codes
    const vehicleCodes = vehicles.map((v) => v.code_vehicule)

    // Try to get pre-calculated alerts from file
    let alerts = []

    try {
      // Read from the file
      const filePath = path.join(process.cwd(), "alerts", "document-alerts.json")

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8")
        const allAlerts = JSON.parse(fileContent)

        // Filter alerts for this user's vehicles
        alerts = allAlerts.filter((alert: { code_vehicule: string }) => vehicleCodes.includes(alert.code_vehicule))
      } else {
        console.log("Alerts file not found, calculating on-demand")
        // If file doesn't exist, calculate alerts on-demand (fallback)
        alerts = await calculateDocumentAlerts(vehicles)
      }
    } catch (fileError) {
      console.error("Error reading alerts file:", fileError)
      // Fallback to calculating alerts on-demand
      alerts = await calculateDocumentAlerts(vehicles)
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching document alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// Fallback function to calculate alerts on-demand
async function calculateDocumentAlerts(vehicles: Vehiculetype[]) {
  const alerts = []
  const today = new Date()

  for (const vehicle of vehicles) {
    try {
      // Get document info for this vehicle using stored procedure
      const docs: { date_fin_assurance?: string; date_fin_controle_technique?: string; date_fin_atmd?: string; date_fin_permis_circuler?: string; date_fin_certificat?: string }[] = await prisma.$queryRawUnsafe(`
        EXEC PS_GET_DOCUMENT_BORD '${vehicle.code_vehicule}'
      `)

      if (docs && docs.length > 0) {
        const doc = docs[0]

        // Check each document type
        const documentTypes = [
          { type: "Assurance", date: doc.date_fin_assurance },
          { type: "Contrôle Technique", date: doc.date_fin_controle_technique },
          { type: "ATMD", date: doc.date_fin_atmd },
          { type: "Permis de Circuler", date: doc.date_fin_permis_circuler },
          { type: "Certificat", date: doc.date_fin_certificat },
        ]

        for (const docType of documentTypes) {
          if (docType.date) {
            const expiryDate = new Date(docType.date)
            const diffTime = expiryDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays <= 10) {
              alerts.push({
                code_vehicule: vehicle.code_vehicule,
                n_immatriculation: vehicle.n_immatriculation,
                marque_designation: vehicle.marque_designation,
                type_designation: vehicle.type_designation,
                document_type: docType.type,
                date_fin: docType.date,
                jours_restants: diffDays,
              })
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing documents for vehicle ${vehicle.code_vehicule}:`, error)
    }
  }

  return alerts
}
