"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Save, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

type Type = {
  id_type: number
  designation: string
  FK_type_REF_marque: {
    designation: string
  }
}

type Gamme = {
  code_gamme: string
  designation: string
  unite_mesure: string
}

type Operation = {
  code_operation: string
  designation: string
}

type ProgrammeEntry = {
  gamme: string
  operation: string
  periode: number
}

export default function AjouterProgrammePage({ params }: { params: { typeId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeId = Number.parseInt(params.typeId)
  const uniteMesure = searchParams.get("unite_mesure") || "kilometrage"

  const [type, setType] = useState<Type | null>(null)
  const [gammes, setGammes] = useState<Gamme[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)

  const [showNewGammeModal, setShowNewGammeModal] = useState(false)
  const [newGamme, setNewGamme] = useState({ code_gamme: "", designation: "", unite_mesure: uniteMesure })

  const [showNewOperationModal, setShowNewOperationModal] = useState(false)
  const [newOperation, setNewOperation] = useState({ code_operation: "", designation: "" })

  const [programmeEntries, setProgrammeEntries] = useState<ProgrammeEntry[]>([])
  const [selectedGamme, setSelectedGamme] = useState("")
  const [selectedOperation, setSelectedOperation] = useState("")
  const [selectedPeriode, setSelectedPeriode] = useState(uniteMesure === "kilometrage" ? 5 : 250)

  // Define periods based on unite_mesure
  const periodes =
    uniteMesure === "kilometrage"
      ? [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
      : [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch type details
        const typeResponse = await fetch(`/api/types`)
        if (!typeResponse.ok) throw new Error("Failed to fetch type")
        const typesData = await typeResponse.json()
        const typeData = typesData.find((t: Type) => t.id_type === typeId)
        setType(typeData)

        // Fetch gammes
        const gammesResponse = await fetch("/api/gammes")
        if (!gammesResponse.ok) throw new Error("Failed to fetch gammes")
        const gammesData = await gammesResponse.json()

        // Filter gammes by unite_mesure
        const filteredGammes = gammesData.filter((gamme: Gamme) => gamme.unite_mesure === uniteMesure)

        setGammes(filteredGammes)

        // Fetch operations
        const operationsResponse = await fetch("/api/operations")
        if (!operationsResponse.ok) throw new Error("Failed to fetch operations")
        const operationsData = await operationsResponse.json()
        setOperations(operationsData)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [typeId, uniteMesure])

  const handleAddGamme = async () => {
    try {
      // Generate UUID if not provided
      if (!newGamme.code_gamme) {
        newGamme.code_gamme = uuidv4()
      }

      // Ensure unite_mesure is set correctly
      const gammeToAdd = {
        ...newGamme,
        unite_mesure: uniteMesure,
      }

      const response = await fetch("/api/gammes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gammeToAdd),
      })

      if (!response.ok) throw new Error("Failed to add gamme")

      const addedGamme = await response.json()
      setGammes([...gammes, addedGamme])
      setNewGamme({ code_gamme: "", designation: "", unite_mesure: uniteMesure })
      setShowNewGammeModal(false)
    } catch (error) {
      console.error("Error:", error)
      alert("Une erreur s'est produite lors de l'ajout de la gamme.")
    }
  }

  const handleAddOperation = async () => {
    try {
      // Generate UUID if not provided
      if (!newOperation.code_operation) {
        newOperation.code_operation = uuidv4()
      }

      const response = await fetch("/api/operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOperation),
      })

      if (!response.ok) throw new Error("Failed to add operation")

      const addedOperation = await response.json()
      setOperations([...operations, addedOperation])
      setNewOperation({ code_operation: "", designation: "" })
      setShowNewOperationModal(false)
    } catch (error) {
      console.error("Error:", error)
      alert("Une erreur s'est produite lors de l'ajout de l'opération.")
    }
  }

  const handleAddEntry = () => {
    if (!selectedGamme || !selectedOperation) {
      alert("Veuillez sélectionner une gamme et une opération.")
      return
    }

    // Check if entry already exists
    const existingEntryIndex = programmeEntries.findIndex(
      (entry) =>
        entry.gamme === selectedGamme && entry.operation === selectedOperation && entry.periode === selectedPeriode,
    )

    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...programmeEntries]
      updatedEntries[existingEntryIndex] = {
        gamme: selectedGamme,
        operation: selectedOperation,
        periode: selectedPeriode,
      }
      setProgrammeEntries(updatedEntries)
    } else {
      // Add new entry
      setProgrammeEntries([
        ...programmeEntries,
        {
          gamme: selectedGamme,
          operation: selectedOperation,
          periode: selectedPeriode,
        },
      ])
    }
  }

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = [...programmeEntries]
    updatedEntries.splice(index, 1)
    setProgrammeEntries(updatedEntries)
  }

  const handleSaveProgramme = async () => {
    if (programmeEntries.length === 0) {
      alert("Veuillez ajouter au moins une entrée au programme.")
      return
    }

    try {
      // Group entries by gamme and operation
      const groupedEntries: Record<string, Record<string, number>> = {}

      programmeEntries.forEach((entry) => {
        if (!groupedEntries[entry.gamme]) {
          groupedEntries[entry.gamme] = {}
        }

        if (!groupedEntries[entry.gamme][entry.operation]) {
          groupedEntries[entry.gamme][entry.operation] = entry.periode
        }
      })

      // Create programme for each gamme-operation pair
      for (const gammeCode in groupedEntries) {
        for (const operationCode in groupedEntries[gammeCode]) {
          const periode = groupedEntries[gammeCode][operationCode]

          await fetch("/api/programmes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code_gamme: gammeCode,
              code_operation: operationCode,
              code_type: typeId,
              periode,
            }),
          })
        }
      }

      alert("Programme d'entretien créé avec succès!")
      router.push("/documents/entretien")
    } catch (error) {
      console.error("Error:", error)
      alert("Une erreur s'est produite lors de la création du programme.")
    }
  }

  const getGammeDesignation = (code: string) => {
    const gamme = gammes.find((g) => g.code_gamme === code)
    return gamme ? gamme.designation : code
  }

  const getOperationDesignation = (code: string) => {
    const operation = operations.find((o) => o.code_operation === code)
    return operation ? operation.designation : code
  }

  const getOperationValue = (code: string) => {
    const operation = operations.find((o) => o.code_operation === code)
    if (!operation) return code

    // Extract the first letter of the operation designation if it's one of V, R, N, G
    const firstLetter = operation.designation.charAt(0).toUpperCase()
    if (["V", "R", "N", "G"].includes(firstLetter)) {
      return firstLetter
    }

    return operation.designation
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
            <h1 className="text-2xl font-bold text-center">
              Ajouter Programme d&apos;Entretien ({uniteMesure === "kilometrage" ? "Kilométrage" : "Heures"})
            </h1>
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

      {/* Add Entry Form */}
      <div className="container mx-auto my-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ajouter une entrée</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gamme</label>
            <div className="flex">
              <select
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={selectedGamme}
                onChange={(e) => setSelectedGamme(e.target.value)}
              >
                <option value="">Sélectionner une gamme</option>
                {gammes.map((gamme) => (
                  <option key={gamme.code_gamme} value={gamme.code_gamme}>
                    {gamme.designation}
                  </option>
                ))}
              </select>
              <button onClick={() => setShowNewGammeModal(true)} className="p-2 bg-[#0a2d5e] text-white rounded-r-md">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Opération</label>
            <div className="flex">
              <select
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
              >
                <option value="">Sélectionner une opération</option>
                {operations.map((operation) => (
                  <option key={operation.code_operation} value={operation.code_operation}>
                    {operation.designation}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewOperationModal(true)}
                className="p-2 bg-[#0a2d5e] text-white rounded-r-md"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {uniteMesure === "kilometrage" ? "Période (KM x 1000)" : "Période (heures)"}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(Number.parseInt(e.target.value))}
            >
              {periodes.map((periode) => (
                <option key={periode} value={periode}>
                  {periode}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleAddEntry} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Ajouter à la table
        </button>
      </div>

      {/* Programme Table */}
      <div className="container mx-auto my-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Programme d&apos;entretien</h2>

        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 border text-left font-semibold">Gamme</th>
              <th className="px-4 py-3 border text-left font-semibold">Opération</th>
              <th className="px-4 py-3 border text-left font-semibold">
                {uniteMesure === "kilometrage" ? "Période (KM x 1000)" : "Période (heures)"}
              </th>
              <th className="px-4 py-3 border text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programmeEntries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center border">
                  Aucune entrée ajoutée
                </td>
              </tr>
            ) : (
              programmeEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">{getGammeDesignation(entry.gamme)}</td>
                  <td className="px-4 py-3 border">{getOperationDesignation(entry.operation)}</td>
                  <td className="px-4 py-3 border">{entry.periode}</td>
                  <td className="px-4 py-3 border text-center">
                    <button
                      onClick={() => handleRemoveEntry(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveProgramme}
            className="px-4 py-2 bg-[#0a2d5e] text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="mr-2 h-5 w-5" />
            Enregistrer le programme
          </button>
        </div>
      </div>

      {/* New Gamme Modal */}
      {showNewGammeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle gamme</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code (optionnel)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newGamme.code_gamme}
                  onChange={(e) => setNewGamme({ ...newGamme, code_gamme: e.target.value })}
                  placeholder="Laissez vide pour générer automatiquement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Désignation</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newGamme.designation}
                  onChange={(e) => setNewGamme({ ...newGamme, designation: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unité de mesure</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  value={uniteMesure === "kilometrage" ? "Kilométrage" : "Heures"}
                  disabled
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowNewGammeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddGamme}
                className="px-4 py-2 bg-[#0a2d5e] text-white rounded-md hover:bg-blue-700"
                disabled={!newGamme.designation}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Operation Modal */}
      {showNewOperationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle opération</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code (optionnel)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newOperation.code_operation}
                  onChange={(e) => setNewOperation({ ...newOperation, code_operation: e.target.value })}
                  placeholder="Laissez vide pour générer automatiquement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Désignation</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newOperation.designation}
                  onChange={(e) => setNewOperation({ ...newOperation, designation: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Utilisez V (Vidange), R (Remplacement), N (Nettoyage), ou G (Graissage) comme première lettre pour
                  indiquer le type d&apos;opération.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowNewOperationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddOperation}
                className="px-4 py-2 bg-[#0a2d5e] text-white rounded-md hover:bg-blue-700"
                disabled={!newOperation.designation}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
