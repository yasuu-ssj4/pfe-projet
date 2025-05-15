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

// Helper function to determine if we need to multiply the periode by 1000
function shouldMultiplyPeriode(uniteMesure: string): boolean {
  const uniteLower = uniteMesure.toLowerCase()
  return uniteLower === "km" || uniteLower === "kilometrage"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Get all vehicles for this user
    const vehicles = await prisma.$queryRawUnsafe<VehicleType[]>(`
      EXEC PS_GET_ALL_VEHICULE_INFOS_PAR_UTILISATEUR ${userId}
    `)

    // Get average kilometrage values
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
    const avgKilometrageMap = new Map(avgKilometrageData.map((item: any) => [item.code_vehicule, item.valeur_moy_kil]))

    // Load or initialize the kilometrage tracker
    const kilometrageTracker = loadKilometrageTracker()

    // Get maintenance programs for all vehicles
    const maintenancePrograms: MaintenanceProgram[] = []
    for (const vehicle of vehicles) {
      // Get vehicle type
      const vehicleType = await prisma.vehicule.findUnique({
        where: { code_vehicule: vehicle.code_vehicule },
        select: { code_type: true },
      })

      if (!vehicleType || !vehicleType.code_type) continue

      // Get maintenance programs for this type
      const programs = await prisma.programme_entretien.findMany({
        where: { code_type: vehicleType.code_type },
        include: {
          gamme: true,
          operation: true,
        },
      })

      maintenancePrograms.push(...(programs as unknown as MaintenanceProgram[]))

      // Initialize tracker for this vehicle if not exists
      if (!kilometrageTracker[vehicle.code_vehicule]) {
        kilometrageTracker[vehicle.code_vehicule] = {}
      }

      // Initialize tracker for each program if not exists
      for (const program of programs) {
        // Skip invalid programs
        if (!program.code_gamme || !program.code_operation) {
          console.warn("Skipping invalid program:", program)
          continue
        }

        const programKey = generateProgramKey(program.code_type, program.code_gamme, program.code_operation)

        if (programKey === "invalid-key") continue

        if (!kilometrageTracker[vehicle.code_vehicule][programKey]) {
          kilometrageTracker[vehicle.code_vehicule][programKey] = {
            code_type: program.code_type,
            code_gamme: program.code_gamme,
            code_operation: program.code_operation,
            valeur_accumulee: 0,
            periode: program.periode,
            derniere_mise_a_jour: new Date().toISOString(),
          }
        }
      }
    }

    // Save the updated tracker
    saveKilometrageTracker(kilometrageTracker)

    // Generate alerts
    const alerts: MaintenanceAlert[] = []
    for (const vehicle of vehicles) {
      const vehicleTracker = kilometrageTracker[vehicle.code_vehicule]
      if (!vehicleTracker) continue

      let avgKilometrage = avgKilometrageMap.get(vehicle.code_vehicule) as number
      if (typeof avgKilometrage !== "number" || isNaN(avgKilometrage)) {
        avgKilometrage = 300 // Default to 300 if not found or invalid
      }

      for (const [programKey, programTracker] of Object.entries(vehicleTracker)) {
        // Skip invalid keys
        if (programKey === "invalid-key") continue

        // Skip entries with invalid data
        if (!programTracker.code_gamme || !programTracker.code_operation) {
          console.warn("Skipping invalid tracker entry:", programTracker)
          continue
        }

        const program = maintenancePrograms.find(
          (p) =>
            p.code_type === programTracker.code_type &&
            p.code_gamme === programTracker.code_gamme &&
            p.code_operation === programTracker.code_operation,
        )

        if (!program) continue

        const uniteMesure = program.gamme.unite_mesure || "kilometrage"
        const multiplyFactor = shouldMultiplyPeriode(uniteMesure) ? 1000 : 1
        const periodeAdjusted = program.periode * multiplyFactor
        const valeurRestante = periodeAdjusted - programTracker.valeur_accumulee

        // Alert if remaining value is less than average kilometrage
        if (valeurRestante <= avgKilometrage) {
          alerts.push({
            code_vehicule: vehicle.code_vehicule,
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
      }
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error generating maintenance alerts:", error)
    return NextResponse.json({ error: "Failed to generate maintenance alerts" }, { status: 500 })
  }
}

// Function to reset a vehicle's gamme counter
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code_vehicule, code_type, code_gamme, code_operation } = body

    // Load the kilometrage tracker
    const kilometrageTracker = loadKilometrageTracker()

    // Generate the program key
    const programKey = generateProgramKey(code_type, code_gamme, code_operation)

    // Reset the counter for this vehicle and program
    if (kilometrageTracker[code_vehicule] && kilometrageTracker[code_vehicule][programKey]) {
      kilometrageTracker[code_vehicule][programKey].valeur_accumulee = 0
      kilometrageTracker[code_vehicule][programKey].derniere_mise_a_jour = new Date().toISOString()
    }

    // Save the updated tracker
    saveKilometrageTracker(kilometrageTracker)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting maintenance counter:", error)
    return NextResponse.json({ error: "Failed to reset maintenance counter" }, { status: 500 })
  }
}

// Load the kilometrage tracker from JSON file
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

function saveKilometrageTracker(tracker: VehicleKilometrageTracker): void {
  try {
    const alertsDir = path.join(process.cwd(), "alerts")
    const filePath = path.join(alertsDir, "maintenance-kilometrage-tracker.json")

    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true })
    }

    fs.writeFileSync(filePath, JSON.stringify(tracker, null, 2))
  } catch (error) {
    console.error("Error saving kilometrage tracker:", error)
  }
}
