import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code_vehicule, kilo_parcouru_heure_fonctionnement } = body

   
    const result = await prisma.historique_kilometrage_heure.create({
      data: {
        code_vehicule,
        kilo_parcouru_heure_fonctionnement: Number(kilo_parcouru_heure_fonctionnement),
        date: new Date(),
      },
    })

    // maj le tracker de kiloemtrage
    await updateMaintenanceTracker(code_vehicule, Number(kilo_parcouru_heure_fonctionnement))
   // envoyer les donnees a predire 
   await ApiModel(code_vehicule);
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error adding kilometrage:", error)
    return NextResponse.json({ error: "Failed to add kilometrage" }, { status: 500 })
  }
}

// la fonction pour faire maj
async function updateMaintenanceTracker(code_vehicule: string, kilometrage: number) {
  try {
    const alertsDir = path.join(process.cwd(), "alerts")
    const filePath = path.join(alertsDir, "maintenance-kilometrage-tracker.json")

    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true })
    }

    type TrackerType = {
      [vehiculeCode: string]: {
        [gammeId: string]: {
          valeur_accumulee: number
          derniere_mise_a_jour: string
        }
      }
    }

    let tracker: TrackerType = {}
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8")
      tracker = JSON.parse(fileContent)
    }

    // Update all gammes for this vehicle
    if (tracker[code_vehicule]) {
      for (const gammeId in tracker[code_vehicule]) {
        tracker[code_vehicule][gammeId].valeur_accumulee += kilometrage
        tracker[code_vehicule][gammeId].derniere_mise_a_jour = new Date().toISOString()
      }

      // Save the updated tracker
      fs.writeFileSync(filePath, JSON.stringify(tracker, null, 2))
    }
  } catch (error) {
    console.error("Error updating maintenance tracker:", error)
  }
}
 const ApiModel = async (code_vehicule: string) => {
    try {

    const res = await fetch("/api/model", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code_vehicule }),
});

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoie de les donnees")
      }

     const data = await res.json()
     console.log(data);
     
     
    } catch (error) {
      console.error("Error:", error)
     
    }
  }
