import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

// This API endpoint will be called by a cron job at midnight
export async function GET() {
  try {
    console.log("Starting midnight check at:", new Date().toISOString())

    // Get all vehicles from the database using Prisma directly
    const allVehicles = await prisma.vehicule.findMany({
      select: {
        code_vehicule: true,
        n_immatriculation: true,
        FK_vehicule_REF_type: {
            select: {
              designation: true,
              FK_type_REF_marque: {
                select: {
                  designation: true,
                },
              },
            },
        },
        date_fin_assurance: true,
        date_fin_controle_technique: true,
        date_fin_atmd: true,
        date_fin_permis_circuler: true,
        date_fin_certificat: true,
      },
    })

    // Process document expiration alerts
    const documentAlerts = await processDocumentAlerts(allVehicles)

    // Process kilometrage alerts
    const kilometrageAlerts = await processKilometrageAlerts(allVehicles)

    // Store the results in a JSON file for quick retrieval
    await storeAlertsInFile(documentAlerts, kilometrageAlerts)

    console.log("Completed midnight check at:", new Date().toISOString())
    console.log(`Processed ${documentAlerts.length} document alerts and ${kilometrageAlerts.length} kilometrage alerts`)

    return NextResponse.json({
      success: true,
      message: "Midnight check completed successfully",
      timestamp: new Date().toISOString(),
      stats: {
        documentAlerts: documentAlerts.length,
        kilometrageAlerts: kilometrageAlerts.length,
      },
    })
  } catch (error) {
    console.error("Error in midnight check:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute midnight check",
      },
      { status: 500 },
    )
  }
}

// Process document expiration alerts
async function processDocumentAlerts(vehicles: { code_vehicule: string; n_immatriculation: string; date_fin_assurance: Date | null; date_fin_controle_technique: Date | null; date_fin_atmd: Date | null; date_fin_permis_circuler: Date | null; date_fin_certificat: Date | null; FK_vehicule_REF_type: { designation: string; FK_type_REF_marque: { designation: string } } }[]) {
  const today = new Date()
  const alerts = []

  for (const vehicle of vehicles) {
    // Check each document type
    const documentTypes = [
      { type: "Assurance", date: vehicle.date_fin_assurance },
      { type: "Contrôle Technique", date: vehicle.date_fin_controle_technique },
      { type: "ATMD", date: vehicle.date_fin_atmd },
      { type: "Permis de Circuler", date: vehicle.date_fin_permis_circuler },
      { type: "Certificat", date: vehicle.date_fin_certificat },
    ]

    for (const doc of documentTypes) {
      if (doc.date) {
        const expiryDate = new Date(doc.date)
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Alert if 10 days or less remaining
        if (diffDays <= 10) {
          alerts.push({
            code_vehicule: vehicle.code_vehicule,
            n_immatriculation: vehicle.n_immatriculation,
            marque_designation: vehicle.FK_vehicule_REF_type.FK_type_REF_marque.designation,    
            type_designation: vehicle.FK_vehicule_REF_type.designation,
            document_type: doc.type,
            date_fin: doc.date,
            jours_restants: diffDays,
          })
        }
      }
    }
  }

  return alerts
}

// Process kilometrage alerts
async function processKilometrageAlerts(vehicles: { code_vehicule: string; n_immatriculation: string; date_fin_assurance: Date | null; date_fin_controle_technique: Date | null; date_fin_atmd: Date | null; date_fin_permis_circuler: Date | null; date_fin_certificat: Date | null; FK_vehicule_REF_type: { designation: string; FK_type_REF_marque: { designation: string } } }[]) {
  const alerts = []
  const today = new Date()

  for (const vehicle of vehicles) {
    // Get last kilometrage update using Prisma
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

      // Alert if more than 3 days since last update
      if (diffDays > 3) {
        alerts.push({
          code_vehicule: vehicle.code_vehicule,
          n_immatriculation: vehicle.n_immatriculation,
          marque_designation: vehicle.FK_vehicule_REF_type.FK_type_REF_marque.designation,
          type_designation: vehicle.FK_vehicule_REF_type.designation,
          derniere_mise_a_jour: lastUpdate.date,
          jours_depuis_maj: diffDays,
        })
      }
    } else {
      // No update found
      alerts.push({
        code_vehicule: vehicle.code_vehicule,
        n_immatriculation: vehicle.n_immatriculation,
        marque_designation: vehicle.FK_vehicule_REF_type.FK_type_REF_marque.designation,
        type_designation: vehicle.FK_vehicule_REF_type.designation,
        derniere_mise_a_jour: null,
        jours_depuis_maj: 999, // Special value for "never updated"
      })
    }
  }

  return alerts
}

// Store alerts in a file for quick retrieval
async function storeAlertsInFile(documentAlerts: { code_vehicule: string; n_immatriculation: string; marque_designation: string; type_designation: string; document_type: string; date_fin: Date; jours_restants: number }[], kilometrageAlerts: ({ code_vehicule: string; n_immatriculation: string; marque_designation: string; type_designation: string; derniere_mise_a_jour: Date; jours_depuis_maj: number } | { code_vehicule: string; n_immatriculation: string; marque_designation: string; type_designation: string; derniere_mise_a_jour: null; jours_depuis_maj: number })[]) {
  const alertsDir = path.join(process.cwd(), "alerts")

  // Create the alerts directory if it doesn't exist
  if (!fs.existsSync(alertsDir)) {
    fs.mkdirSync(alertsDir, { recursive: true })
  }

  // Write the alerts to files
  fs.writeFileSync(path.join(alertsDir, "document-alerts.json"), JSON.stringify(documentAlerts))

  fs.writeFileSync(path.join(alertsDir, "kilometrage-alerts.json"), JSON.stringify(kilometrageAlerts))

  console.log("Alerts saved to files")
}
