import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

// Définition des types
type TypeVehicule = {
  code_vehicule: string
  code_type: number
}

type ProgrammeEntretien = {
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

type AlerteEntretien = {
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

type SuiviKilometrageVehicule = {
  [code_vehicule: string]: {
    [cle: string]: {
      // clé est un composite de code_type-code_gamme-code_operation
      code_type: number
      code_gamme: string
      code_operation: string
      valeur_accumulee: number
      periode: number
      derniere_mise_a_jour: string
    }
  }
}

// Fonction auxiliaire pour générer une clé unique pour un programme d'entretien
function genererCleProgramme(code_type: number, code_gamme: string, code_operation: string): string {
  // S'assurer que nous avons des valeurs valides avant de créer une clé
  if (
    code_type === null ||
    code_type === undefined ||
    code_gamme === null ||
    code_gamme === undefined ||
    code_operation === null ||
    code_operation === undefined
  ) {
    console.error("Composants de clé de programme invalides:", { code_type, code_gamme, code_operation })
    return "cle-invalide" // Retourner un placeholder pour éviter les plantages
  }
  return `${code_type}-${code_gamme}-${code_operation}`
}

// Fonction pour déterminer si nous devons multiplier la période par 1000
function doitMultiplierPeriode(uniteMesure: string): boolean {
  const uniteMinuscule = uniteMesure.toLowerCase()
  return uniteMinuscule === "km" || uniteMinuscule === "kilometrage"
}

// Charger le suivi de kilométrage à partir du fichier JSON
function chargerSuiviKilometrage(): SuiviKilometrageVehicule {
  const dossierAlertes = path.join(process.cwd(), "alerts")
  const cheminFichier = path.join(dossierAlertes, "maintenance-kilometrage-tracker.json")

  try {
    if (!fs.existsSync(dossierAlertes)) {
      fs.mkdirSync(dossierAlertes, { recursive: true })
    }

    if (fs.existsSync(cheminFichier)) {
      const contenuFichier = fs.readFileSync(cheminFichier, "utf8")
      return JSON.parse(contenuFichier)
    }
  } catch (erreur) {
    console.error("Erreur lors du chargement du suivi de kilométrage:", erreur)
  }

  return {}
}

export async function POST(requete: NextRequest) {
  try {
    const corps = await requete.json()
    const { userId, code_vehicule } = corps

    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 })
    }

    // Récupérer le type de véhicule
    const typeVehicule = await prisma.vehicule.findUnique({
      where: { code_vehicule },
      select: { code_type: true },
    })
    console.log("Type de véhicule:", userId, code_vehicule)

    if (!typeVehicule || !typeVehicule.code_type) {
      return NextResponse.json({ error: "Type de véhicule non trouvé" }, { status: 404 })
    }

    // Obtenir les programmes d'entretien pour ce type
    const programmes = await prisma.programme_entretien.findMany({
      where: { code_type: typeVehicule.code_type },
      include: {
        gamme: true,
        operation: true,
      },
    })

    // Charger le suivi de kilométrage
    const suiviKilometrage = chargerSuiviKilometrage()
    const suiviVehicule = suiviKilometrage[code_vehicule] || {}

    // Obtenir le kilométrage moyen pour ce véhicule
    const reponseKilometrageMoyen = await fetch(
      `${requete.nextUrl.origin}/api/vehicule/kilometrage-heure/getMoyenKilometrage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_utilisateur: userId }),
      },
    )

    if (!reponseKilometrageMoyen.ok) {
      throw new Error("Échec de la récupération du kilométrage moyen")
    }

    const donneesKilometrageMoyen = await reponseKilometrageMoyen.json()
    const kilometrageMoyen =
      donneesKilometrageMoyen.find((item: any) => item.code_vehicule === code_vehicule)?.valeur_moy_kil || 300

    // Générer les alertes pour ce véhicule
    // Retourne TOUTES les gammes d'entretien, pas seulement celles où la différence est inférieure à la valeur moyenne
    const alertes: AlerteEntretien[] = []
    for (const programme of programmes) {
      // Ignorer les programmes invalides
      if (!programme.code_gamme || !programme.code_operation) {
        continue
      }

      const cleProgramme = genererCleProgramme(programme.code_type, programme.code_gamme, programme.code_operation)
      if (cleProgramme === "cle-invalide") continue

      const suiviProgramme = suiviVehicule[cleProgramme] || {
        code_type: programme.code_type,
        code_gamme: programme.code_gamme,
        code_operation: programme.code_operation,
        valeur_accumulee: 0,
        periode: programme.periode,
        derniere_mise_a_jour: new Date().toISOString(),
      }

      const uniteMesure = programme.gamme.unite_mesure || "kilometrage"
      const facteurMultiplication = doitMultiplierPeriode(uniteMesure) ? 1000 : 1
      const periodeAjustee = programme.periode * facteurMultiplication
      const valeurRestante = periodeAjustee - suiviProgramme.valeur_accumulee

      // Ajouter toutes les gammes à la liste des alertes, sans filtrage
      alertes.push({
        code_vehicule,
        code_type: programme.code_type,
        code_gamme: programme.code_gamme,
        code_operation: programme.code_operation,
        gamme_designation: programme.gamme.designation,
        operation_designation: programme.operation.designation,
        periode: periodeAjustee,
        valeur_accumulee: suiviProgramme.valeur_accumulee,
        valeur_restante: valeurRestante,
        unite_mesure: uniteMesure,
      })
    }

    // Retourner toutes les alertes sans filtrage
    return NextResponse.json(alertes)
  } catch (erreur) {
    console.error("Erreur lors de la génération des alertes d'entretien pour le véhicule:", erreur)
    return NextResponse.json(
      { error: "Échec de la génération des alertes d'entretien pour le véhicule" },
      { status: 500 },
    )
  }
}
