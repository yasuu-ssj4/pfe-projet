"use client"

import { useState, useEffect, JSX } from "react"
import { ChevronLeft, Clock, Gauge } from "lucide-react"
import { useRouter } from "next/navigation"

type Type = {
  id_type: number
  designation: string
  FK_type_REF_marque: {
    designation: string
  }
}

type Programme = {
  code_gamme: string
  code_operation: string
  code_type: number
  periode: number
  gamme: {
    code_gamme: string
    designation: string
    unite_mesure: string
  }
  operation: {
    code_operation: string
    designation: string
  }
}

type OperationCategory = {
  title: string
  operations: string[]
}

type ProgrammeData = {
  programmes: Programme[]
  operationsByCategory: OperationCategory[]
  tableData: Record<string, Record<number, string>>
}

export default function VisualiserProgrammePage({ params }: { params: { typeId: string } }) {
  const router = useRouter()
  const typeId = Number.parseInt(params.typeId)

  const [type, setType] = useState<Type | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"kilometrage" | "heure">("kilometrage")

  // Separate data for each type of program
  const [kilometrageData, setKilometrageData] = useState<ProgrammeData | null>(null)
  const [heureData, setHeureData] = useState<ProgrammeData | null>(null)

  // Define periods based on unite_mesure
  const kilometragePeriodes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  const heurePeriodes = [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000]

  // Default categories for organizing operations
  const defaultCategories = [
    "MOTEUR",
    "BOITE DE VITESSES et EMBRAYAGE",
    "TRANSMISSION",
    "CIRCUIT D'AIR ET FREINAGE",
    "CHASSIS ET SUSPENSION",
    "CABINE",
    "AUTRES",
  ]

  // Process programme data to create table data
  const processProgrammeData = (programmeData: Programme[], periodes: number[]): ProgrammeData => {
    // Extract unique gamme designations to use as operations
    const uniqueGammes = Array.from(new Set(programmeData.map((prog: Programme) => prog.gamme.designation))).sort()

    // Organize operations by category
    const categorizedOperations: OperationCategory[] = []

    // Create a category for each default category
    defaultCategories.forEach((category) => {
      categorizedOperations.push({
        title: category,
        operations: [],
      })
    })

    // Assign operations to categories based on keywords
    uniqueGammes.forEach((gamme) => {
      const upperGamme = gamme.toUpperCase()

      if (upperGamme.includes("MOTEUR") || upperGamme.includes("HUILE") || upperGamme.includes("FILTRE")) {
        categorizedOperations[0].operations.push(gamme)
      } else if (upperGamme.includes("BOITE") || upperGamme.includes("VITESSE") || upperGamme.includes("EMBRAYAGE")) {
        categorizedOperations[1].operations.push(gamme)
      } else if (upperGamme.includes("TRANSMISSION") || upperGamme.includes("PONT")) {
        categorizedOperations[2].operations.push(gamme)
      } else if (upperGamme.includes("AIR") || upperGamme.includes("FREIN")) {
        categorizedOperations[3].operations.push(gamme)
      } else if (upperGamme.includes("CHASSIS") || upperGamme.includes("SUSPENSION")) {
        categorizedOperations[4].operations.push(gamme)
      } else if (upperGamme.includes("CABINE")) {
        categorizedOperations[5].operations.push(gamme)
      } else {
        categorizedOperations[6].operations.push(gamme)
      }
    })

    // Remove empty categories
    const filteredCategories = categorizedOperations.filter((cat) => cat.operations.length > 0)

    // Process programme data to populate the table
    const tableDataMap: Record<string, Record<number, string>> = {}

    // For each programme, add its operation to the table
    programmeData.forEach((prog: Programme) => {
      const gammeDesignation = prog.gamme.designation

      if (!tableDataMap[gammeDesignation]) {
        tableDataMap[gammeDesignation] = {}
      }

      // Get the operation code (first letter of operation designation)
      const operationCode = prog.operation.designation.charAt(0).toUpperCase()
      const validOperationCodes = ["V", "R", "N", "G"]
      const value = validOperationCodes.includes(operationCode) ? operationCode : operationCode

      // Calculate all periods where this maintenance should be performed
      const basePeriode = prog.periode

      // Apply the maintenance value to all applicable periods
      periodes.forEach((periode) => {
        if (periode % basePeriode === 0) {
          tableDataMap[gammeDesignation][periode] = value
        }
      })
    })

    return {
      programmes: programmeData,
      operationsByCategory: filteredCategories,
      tableData: tableDataMap,
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [typeResponse, programmeResponse] = await Promise.all([
          fetch(`/api/types`),
          fetch(`/api/programmes?code_type=${typeId}`),
        ])

        if (!typeResponse.ok) throw new Error("Failed to fetch type")
        if (!programmeResponse.ok) throw new Error("Failed to fetch programme")

        const typesData = await typeResponse.json()
        const programmeData = await programmeResponse.json()

        const typeData = typesData.find((t: Type) => t.id_type === typeId)
        setType(typeData)

        if (Array.isArray(programmeData) && programmeData.length > 0) {
          // Separate programmes by unite_mesure
          const kilometrageProgrammes = programmeData.filter((prog) => prog.gamme.unite_mesure === "kilometrage")
          const heureProgrammes = programmeData.filter((prog) => prog.gamme.unite_mesure === "heure")

          // Process each type of programme
          if (kilometrageProgrammes.length > 0) {
            setKilometrageData(processProgrammeData(kilometrageProgrammes, kilometragePeriodes))
            setActiveTab("kilometrage") // Default to kilometrage if available
          }

          if (heureProgrammes.length > 0) {
            setHeureData(processProgrammeData(heureProgrammes, heurePeriodes))
            // If no kilometrage data, default to heure
            if (kilometrageProgrammes.length === 0) {
              setActiveTab("heure")
            }
          }
        }
      } catch (error) {
        console.error("Error:", error)
        alert("Une erreur s'est produite lors du chargement des données.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [typeId])

  // Function to render table rows for categories and operations
  const renderCategoryRows = (data: ProgrammeData | null, periodes: number[]) => {
    if (!data) return null

    const rows: JSX.Element[] = []

    data.operationsByCategory.forEach((category, categoryIndex) => {
      // Add category header row
      rows.push(
        <tr key={`category-${categoryIndex}`} className="bg-gray-200">
          <td className="px-2 py-2 border font-semibold" colSpan={periodes.length + 1}>
            {category.title}
          </td>
        </tr>,
      )

      // Add operation rows for this category
      category.operations.forEach((operation, operationIndex) => {
        rows.push(
          <tr key={`operation-${categoryIndex}-${operationIndex}`}>
            <td className="px-2 py-2 border font-semibold">{operation}</td>
            {periodes.map((periode) => (
              <td key={`cell-${periode}`} className="px-2 py-2 border text-center">
                {data.tableData[operation]?.[periode] || ""}
              </td>
            ))}
          </tr>,
        )
      })
    })

    return rows
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Type non trouvé</p>
      </div>
    )
  }

  // Check if we have any data
  if (!kilometrageData && !heureData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#e6b800] text-[#0a2d5e] p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/documents/entretien")}
                className="flex items-center text-[#0a2d5e] hover:underline"
              >
                <ChevronLeft className="mr-1" />
                Retour
              </button>
              <h1 className="text-2xl font-bold text-center">Programme d&apos;Entretien</h1>
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto my-6 p-4 text-center">
          <p>Aucun programme d&apos;entretien trouvé pour ce type.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#e6b800] text-[#0a2d5e] p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents/entretien")}
              className="flex items-center text-[#0a2d5e] hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">Programme d&apos;Entretien</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <div className="mt-4">
            <p>
              <span className="font-semibold">Type:</span> {type.designation}
            </p>
            <p>
              <span className="font-semibold">Marque:</span> {type.FK_type_REF_marque.designation}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for switching between kilometrage and heure */}
      {kilometrageData && heureData && (
        <div className="container mx-auto mt-6">
          <div className="flex border-b border-gray-300">
            <button
              className={`flex items-center px-4 py-2 font-medium ${
                activeTab === "kilometrage"
                  ? "border-b-2 border-[#0a2d5e] text-[#0a2d5e]"
                  : "text-gray-500 hover:text-[#0a2d5e]"
              }`}
              onClick={() => setActiveTab("kilometrage")}
            >
              <Gauge className="mr-2 h-5 w-5" />
              Programme Kilométrage
            </button>
            <button
              className={`flex items-center px-4 py-2 font-medium ${
                activeTab === "heure"
                  ? "border-b-2 border-[#0a2d5e] text-[#0a2d5e]"
                  : "text-gray-500 hover:text-[#0a2d5e]"
              }`}
              onClick={() => setActiveTab("heure")}
            >
              <Clock className="mr-2 h-5 w-5" />
              Programme Heures
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="container mx-auto mt-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">Légende:</p>
          <p>V: vidange, R: remplacement, N: nettoyage, G: graissage.</p>
        </div>
      </div>

      {/* Kilometrage Table */}
      {activeTab === "kilometrage" && kilometrageData && (
        <div className="container mx-auto my-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Programme d&apos;Entretien (Kilométrage)</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border text-center font-semibold" rowSpan={2}>
                  PERIODE→
                </th>
                <th className="px-2 py-2 border text-center font-semibold" colSpan={kilometragePeriodes.length}>
                  PERIODE EN KM X 1000
                </th>
              </tr>
              <tr className="bg-gray-100">
                {kilometragePeriodes.map((periode) => (
                  <th key={periode} className="px-2 py-2 border text-center font-semibold w-10">
                    {periode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-200">
                <td className="px-2 py-2 border font-semibold">GAMME↓</td>
                <td className="border" colSpan={kilometragePeriodes.length}></td>
              </tr>

              {renderCategoryRows(kilometrageData, kilometragePeriodes)}

              {/* Special row for PURGE RESERVOIR D'AIR */}
              <tr className="bg-gray-200">
                <td className="px-2 py-2 border font-semibold" colSpan={kilometragePeriodes.length + 1}>
                  CIRCUIT D&apos;AIR ET FREINAGE
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 border font-semibold">PURGE RESERVOIR D&apos;AIR</td>
                <td className="px-2 py-2 border text-center font-semibold" colSpan={kilometragePeriodes.length}>
                  QUOTIDIEN
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Heure Table */}
      {activeTab === "heure" && heureData && (
        <div className="container mx-auto my-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Programme d&apos;Entretien (Heures)</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border text-center font-semibold" rowSpan={2}>
                  PERIODE→
                </th>
                <th className="px-2 py-2 border text-center font-semibold" colSpan={heurePeriodes.length}>
                  PERIODE EN HEURES
                </th>
              </tr>
              <tr className="bg-gray-100">
                {heurePeriodes.map((periode) => (
                  <th key={periode} className="px-2 py-2 border text-center font-semibold w-10">
                    {periode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-200">
                <td className="px-2 py-2 border font-semibold">GAMME↓</td>
                <td className="border" colSpan={heurePeriodes.length}></td>
              </tr>

              {renderCategoryRows(heureData, heurePeriodes)}

              {/* Special row for PURGE RESERVOIR D'AIR */}
              <tr className="bg-gray-200">
                <td className="px-2 py-2 border font-semibold" colSpan={heurePeriodes.length + 1}>
                  CIRCUIT D&apos;AIR ET FREINAGE
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 border font-semibold">PURGE RESERVOIR D&apos;AIR</td>
                <td className="px-2 py-2 border text-center font-semibold" colSpan={heurePeriodes.length}>
                  QUOTIDIEN
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="container mx-auto my-6 p-4 bg-gray-100 rounded-lg">
        <p className="font-italic">N.B:</p>
        <p>
          -Une vérification quotidienne des niveaux et la densité électrolyte des batteries est{" "}
          <span className="font-semibold underline">obligatoire</span>.
        </p>
        <p>
          -Le remplacement et/ou vérification du filtre à air est{" "}
          <span className="font-semibold underline">impératif</span>, si la lampe témoin s&apos;allume.
        </p>
      </div>
    </div>
  )
}
