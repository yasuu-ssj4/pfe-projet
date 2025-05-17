"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Save, Check, ChevronRight, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Helper function to get current user ID (placeholder)

type VehicleImb = {
  code_vehicule: string
  code_structure: string
  status_date: Date
}

export default function AjouterImmobilisationPage({ userId }: { userId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState<VehicleImb[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [editableValues, setEditableValues] = useState<Record<string, string>>({})
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({})
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({})
  const [editingCell, setEditingCell] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    const fetchImmobilisedVehicles = async () => {
      try {
        setLoading(true)
     
        const response = await fetch("/api/immobilisation/vehicules-imb", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch immobilised vehicles")
        }

        const data = await response.json()
        console.log("Fetched immobilised vehicles:", data)

        setVehicles(data.immobilizedVehicles || [])
      } catch (error) {
        console.error("Error fetching immobilised vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImmobilisedVehicles()
  }, [])

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.code_vehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.code_structure.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate data
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)

  const handleInputChange = (code_vehicule: string, field: string, value: string) => {
    setEditableValues({
      ...editableValues,
      [`${code_vehicule}-${field}`]: value,
    })

    // When a field is edited, mark the row as unsaved
    setSavedRows({
      ...savedRows,
      [code_vehicule]: false,
    })
  }

  const getValue = (code_vehicule: string, field: string, defaultValue = "") => {
    const key = `${code_vehicule}-${field}`
    return editableValues[key] !== undefined ? editableValues[key] : defaultValue
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString)
     
      return format(date, "dd/MM/yyyy", { locale: fr })
    } catch (error) {
      console.error("Error formatting date for display:", error, dateString)
      return dateString
    }
  }
  console.log(formatDateForDisplay("2023-10-01T00:00:00Z"))


  const handleSaveRow = async (vehicle: VehicleImb) => {
    try {
      // Mark row as saving
      setSavingRows({
        ...savingRows,
        [vehicle.code_vehicule]: true,
      })

      // Get the values to save
      const lieu = getValue(vehicle.code_vehicule, "lieu")
      const cause_immobilisation = getValue(vehicle.code_vehicule, "cause")
      const action = getValue(vehicle.code_vehicule, "action")
      const echeance = getValue(vehicle.code_vehicule, "echeance")

      // Validate required fields
      if (!lieu || !cause_immobilisation || !action) {
        alert("Veuillez remplir tous les champs obligatoires (Lieu, Cause, Action)")
        setSavingRows({
          ...savingRows,
          [vehicle.code_vehicule]: false,
        })
        return
      }

      // Prepare payload with proper date handling
      const payload = {
        code_vehicule: vehicle.code_vehicule,
        date_immobilisation: new Date(vehicle.status_date),
        lieu,
        cause_immobilisation,
        action,
        echeance: echeance ? new Date(echeance).toISOString() : null,
      }

      console.log("Saving payload:", payload)

      const response = await fetch("/api/immobilisation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save immobilisation")
      }

      // Mark row as saved
      setSavedRows({
        ...savedRows,
        [vehicle.code_vehicule]: true,
      })

      
      setTimeout(() => {
        setSavedRows({
          ...savedRows,
          [vehicle.code_vehicule]: false,
        })
      }, 2000)
    } catch (error) {
      console.error("Error saving immobilisation:", error)
      alert("Une erreur s'est produite lors de l'enregistrement de l'immobilisation")
    } finally {
      // Mark row as not saving
      setSavingRows({
        ...savingRows,
        [vehicle.code_vehicule]: false,
      })
      
    }
  }

  const handleCellClick = (code_vehicule: string, field: string) => {
    setEditingCell(`${code_vehicule}-${field}`)
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, code_vehicule: string, field: string) => {
    if (e.key === "Enter") {
      setEditingCell(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0a2d5e] text-white p-4">
        <div className="container mx-auto">
         <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">AJOUTER IMMOBILISATION</h1>
            <button
              onClick={() => router.push("/documents/immobilisation/consultation")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <FileText className="mr-1" />
              Consultation
            </button>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p>
                <span className="font-semibold">Date:</span> {format(new Date(), "dd/MM/yyyy", { locale: fr })}
              </p>
            </div>
            <div className="flex items-center bg-white rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher..."
                className="px-3 py-2 text-black outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-yellow-500 p-2">
                <Search className="h-5 w-5 text-[#0a2d5e]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="container mx-auto my-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a2d5e]"></div>
          </div>
        ) : paginatedVehicles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun véhicule immobilisé trouvé</p>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border text-left font-semibold">CODE VEHICULE</th>
                <th className="px-4 py-3 border text-left font-semibold">STRUCTURE</th>
                <th className="px-4 py-3 border text-left font-semibold">DATE IMMOBILISATION</th>
                <th className="px-4 py-3 border text-left font-semibold">LIEU</th>
                <th className="px-4 py-3 border text-left font-semibold">CAUSES D'IMMOBILISATION</th>
                <th className="px-4 py-3 border text-left font-semibold">ACTIONS ENGAGEES</th>
                <th className="px-4 py-3 border text-left font-semibold">ECHEANCE</th>
                <th className="px-4 py-3 border text-center font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 border">{vehicle.code_vehicule}</td>
                  <td className="px-4 py-3 border">{vehicle.code_structure}</td>
                  <td className="px-4 py-3 border">{new Date(vehicle.status_date).toLocaleDateString('fr-FR')}</td>
                  <td
                    className="px-4 py-3 border cursor-text"
                    onClick={() => handleCellClick(vehicle.code_vehicule, "lieu")}
                  >
                    {editingCell === `${vehicle.code_vehicule}-lieu` ? (
                      <input
                        type="text"
                        className="w-full outline-none bg-transparent"
                        value={getValue(vehicle.code_vehicule, "lieu")}
                        onChange={(e) => handleInputChange(vehicle.code_vehicule, "lieu", e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => handleKeyDown(e, vehicle.code_vehicule, "lieu")}
                        autoFocus
                      />
                    ) : (
                      getValue(vehicle.code_vehicule, "lieu") || <span className="text-gray-400"></span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 border cursor-text"
                    onClick={() => handleCellClick(vehicle.code_vehicule, "cause")}
                  >
                    {editingCell === `${vehicle.code_vehicule}-cause` ? (
                      <input
                        type="text"
                        className="w-full outline-none bg-transparent"
                        value={getValue(vehicle.code_vehicule, "cause")}
                        onChange={(e) => handleInputChange(vehicle.code_vehicule, "cause", e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => handleKeyDown(e, vehicle.code_vehicule, "cause")}
                        autoFocus
                      />
                    ) : (
                      getValue(vehicle.code_vehicule, "cause") || <span className="text-gray-400"></span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 border cursor-text"
                    onClick={() => handleCellClick(vehicle.code_vehicule, "action")}
                  >
                    {editingCell === `${vehicle.code_vehicule}-action` ? (
                      <input
                        type="text"
                        className="w-full outline-none bg-transparent"
                        value={getValue(vehicle.code_vehicule, "action")}
                        onChange={(e) => handleInputChange(vehicle.code_vehicule, "action", e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => handleKeyDown(e, vehicle.code_vehicule, "action")}
                        autoFocus
                      />
                    ) : (
                      getValue(vehicle.code_vehicule, "action") || <span className="text-gray-400"></span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 border cursor-text"
                    onClick={() => handleCellClick(vehicle.code_vehicule, "echeance")}
                  >
                    {editingCell === `${vehicle.code_vehicule}-echeance` ? (
                      <input
                        type="date"
                        className="w-full outline-none bg-transparent"
                        value={getValue(vehicle.code_vehicule, "echeance")}
                        onChange={(e) => handleInputChange(vehicle.code_vehicule, "echeance", e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => handleKeyDown(e, vehicle.code_vehicule, "echeance")}
                        autoFocus
                      />
                    ) : (
                      getValue(vehicle.code_vehicule, "echeance") || <span className="text-gray-400"></span>
                    )}
                  </td>
                  <td className="px-4 py-3 border text-center">
                    <button
                      onClick={() => handleSaveRow(vehicle)}
                      disabled={savingRows[vehicle.code_vehicule]}
                      className={`p-2 rounded ${
                        savedRows[vehicle.code_vehicule]
                          ? "bg-green-500 text-white"
                          : savingRows[vehicle.code_vehicule]
                            ? "bg-gray-400 text-white"
                            : "bg-[#0a2d5e] text-white"
                      }`}
                    >
                      {savedRows[vehicle.code_vehicule] ? (
                        <Check className="h-5 w-5" />
                      ) : savingRows[vehicle.code_vehicule] ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="container mx-auto my-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page ? "bg-[#0a2d5e] text-white" : "border border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
