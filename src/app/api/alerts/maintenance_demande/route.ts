import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

// Define types
type VehicleType = {
  code_vehicule: string
  code_type: number
}

type MaintenanceProgram = {
  code_type: number
  code_gamme: string
  code_operation: string
  periode: number
  gamme: {
    designation: string
    unite_mesure: string
  }
  operation: {
    designation: string
  }
}

type MaintenanceAlert = {
  code_vehicule: string
  code_type: number
  code_gamme: string
  code_operation: string
  gamme_designation: string
  operation_designation: string
  periode: number
  valeur_accumulee: number
  valeur_restante: number
  unite_mesure: string
}

type VehicleKilometrageTracker = {
  [code_vehicule: string]: {
    [key: string]: {
      // key is a composite of code_type-code_gamme-code_operation
      code_type: number
      code_gamme: string
      code_operation: string
      valeur_accumulee: number
      periode: number
      derniere_mise_a_jour: string
    }
  }
}

// Helper function to generate a unique key for a maintenance program
function generateProgramKey(code_type: number, code_gamme: string, code_operation: string): string {
  // Make sure we have valid values before creating a key
  if (
    code_type === null ||
    code_type === undefined ||
    code_gamme === null ||
    code_gamme === undefined ||
    code_operation === null ||
    code_operation === undefined
  ) {
    console.error("Invalid program key components:", { code_type, code_gamme, code_operation })
    return "invalid-key" // Return a placeholder to avoid crashes
  }
  return `${code_type}-${code_gamme}-${code_operation}`
}


function shouldMultiplyPeriode(uniteMesure: string): boolean {
  const uniteLower = uniteMesure.toLowerCase()
  return uniteLower === "km" || uniteLower === "kilometrage"
}

//recuperer la valeur total du kilometrage
function loadKilometrageTracker(): VehicleKilometrageTracker {
  const alertsDir = path.join(process.cwd(), "alerts")
  const filePath = path.join(alertsDir, "maintenance-kilometrage-tracker.json")

  try {
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true })
    }

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8")
      return JSON.parse(fileContent)
    }
  } catch (error) {
    console.error("Error loading kilometrage tracker:", error)
  }

  return {}
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code_vehicule } = body

    if (!code_vehicule) {
      return NextResponse.json({ error: "Vehicle code is required" }, { status: 400 })
    }

    // recuperer le type
    const vehicleType = await prisma.vehicule.findUnique({
      where: { code_vehicule },
      select: { code_type: true },
    })
    console.log("Vehicle type:", userId , code_vehicule) ;
    
    if (!vehicleType || !vehicleType.code_type) {
      return NextResponse.json({ error: "Vehicle type not found" }, { status: 404 })
    }

    // Get maintenance programs for this type
    const programs = await prisma.programme_entretien.findMany({
      where: { code_type: vehicleType.code_type },
      include: {
        gamme: true,
        operation: true,
      },
    })

    // Load the kilometrage tracker
    const kilometrageTracker = loadKilometrageTracker()
    const vehicleTracker = kilometrageTracker[code_vehicule] || {}

    // Get average kilometrage for this vehicle
    const avgKilometrageResponse = await fetch(
      `${request.nextUrl.origin}/api/vehicule/kilometrage-heure/getMoyenKilometrage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_utilisateur: userId }),
      },
    )

    if (!avgKilometrageResponse.ok) {
      throw new Error("Failed to fetch average kilometrage")
    }

    const avgKilometrageData = await avgKilometrageResponse.json()
    const avgKilometrage =
      avgKilometrageData.find((item: any) => item.code_vehicule === code_vehicule)?.valeur_moy_kil || 300

    // Generate alerts for this vehicle
    const alerts: MaintenanceAlert[] = []
    for (const program of programs) {
      // Skip invalid programs
      if (!program.code_gamme || !program.code_operation) {
        continue
      }

      const programKey = generateProgramKey(program.code_type, program.code_gamme, program.code_operation)
      if (programKey === "invalid-key") continue

      const programTracker = vehicleTracker[programKey] || {
        code_type: program.code_type,
        code_gamme: program.code_gamme,
        code_operation: program.code_operation,
        valeur_accumulee: 0,
        periode: program.periode,
        derniere_mise_a_jour: new Date().toISOString(),
      }

      const uniteMesure = program.gamme.unite_mesure || "kilometrage"
      const multiplyFactor = shouldMultiplyPeriode(uniteMesure) ? 1000 : 1
      const periodeAdjusted = program.periode * multiplyFactor
      const valeurRestante = periodeAdjusted - programTracker.valeur_accumulee

      alerts.push({
        code_vehicule,
        code_type: program.code_type,
        code_gamme: program.code_gamme,
        code_operation: program.code_operation,
        gamme_designation: program.gamme.designation,
        operation_designation: program.operation.designation,
        periode: periodeAdjusted,
        valeur_accumulee: programTracker.valeur_accumulee,
        valeur_restante: valeurRestante,
        unite_mesure: uniteMesure,
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error generating maintenance alerts for vehicle:", error)
    return NextResponse.json({ error: "Failed to generate maintenance alerts for vehicle" }, { status: 500 })
  }
}
