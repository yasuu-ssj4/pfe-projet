"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Edit, Trash2, Search, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

type Type = {
  id_type: number
  designation: string
  id_marque: number
  FK_type_REF_marque: {
    id_marque: number
    designation: string
  }
  progammes_entretien: any[] | null
}

export default function EntretienPage({ userPrivs }: {userPrivs: string[]}) {
  const router = useRouter()
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showProgramTypeModal, setShowProgramTypeModal] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/types")
        if (!response.ok) throw new Error("Failed to fetch types")
        const data = await response.json()
        setTypes(data)
        setLoading(false)
      } catch (error) {
        console.error("Error:", error)
        setLoading(false)
      }
    }

    fetchTypes()
  }, [])

  const filteredTypes = types.filter(
    (type) =>
      type.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.FK_type_REF_marque.designation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedTypes = filteredTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage)

  const handleAddProgramme = (typeId: number) => {
    setSelectedTypeId(typeId)
    setShowProgramTypeModal(true)
  }

  const handleSelectProgramType = (uniteMesure: "kilometrage" | "heure") => {
    if (selectedTypeId) {
      router.push(`/documents/entretien/programme/ajouter/${selectedTypeId}?unite_mesure=${uniteMesure}`)
    }
    setShowProgramTypeModal(false)
  }

  const handleViewProgramme = (typeId: number) => {
    router.push(`/documents/entretien/programme/visualiser/${typeId}`)
  }

  const handleEditProgramme = (typeId: number) => {
    router.push(`/documents/entretien/programme/modifier/${typeId}`)
  }

  const handleDeleteProgramme = async (typeId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce programme d'entretien?")) {
      try {
        const response = await fetch(`/api/programmes/${typeId}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete programme")

        // Update the local state to reflect the deletion
        setTypes(
          types.map((type) => {
            if (type.id_type === typeId) {
              return { ...type, progammes_entretien: null }
            }
            return type
          }),
        )
      } catch (error) {
        console.error("Error:", error)
        alert("Une erreur s'est produite lors de la suppression du programme.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#e6b800] text-[#0a2d5e] p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents")}
              className="flex items-center text-[#0a2d5e] hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">PROGRAMME D&apos;ENTRETIEN</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <div className="mt-4 flex justify-end">
            <div className="flex items-center bg-white rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher..."
                className="px-3 py-2 text-black outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-[#0a2d5e] p-2">
                <Search className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="container mx-auto my-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 border text-left font-semibold">ID Type</th>
              <th className="px-4 py-3 border text-left font-semibold">Type</th>
              <th className="px-4 py-3 border text-left font-semibold">Marque</th>
              <th className="px-4 py-3 border text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center border">
                  Chargement...
                </td>
              </tr>
            ) : paginatedTypes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center border">
                  Aucun type trouvé
                </td>
              </tr>
            ) : (
              paginatedTypes.map((type) => (
                <tr key={type.id_type} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">{type.id_type}</td>
                  <td className="px-4 py-3 border">{type.designation}</td>
                  <td className="px-4 py-3 border">{type.FK_type_REF_marque.designation}</td>
                  <td className="px-4 py-3 border text-center">
                    <div className="flex justify-center space-x-2">
                      {type.progammes_entretien && type.progammes_entretien.length > 0 ? (
                        <>
                          <button
                            onClick={() => handleViewProgramme(type.id_type)}
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            title="Visualiser le programme d'entretien"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(userPrivs.includes('modifier_programme_entretien')) ? () => handleEditProgramme(type.id_type): undefined}
                            className={`p-2 text-white rounded-md 
                            ${(userPrivs.includes('modifier_programme_entretien')) 
                              ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"} 
                            `}
                            disabled={!userPrivs.includes("modifier_programme_entretien")}
                            title={
                                  userPrivs.includes("modifier_programme_entretien")
                                  ? "Modifier le programme d'entretien"
                                  : "Vous n'avez pas le droit d'accéder à cette action"
                                  }
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={userPrivs.includes('supprimer_programme_entretien') ? () => handleDeleteProgramme(type.id_type): undefined}
                            className={`p-2 text-white rounded-md 
                                ${(userPrivs.includes('supprimer_programme_entretien'))
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-gray-400 cursor-not-allowed"}`}
                            disabled={!userPrivs.includes("supprimer_programme_entretien")}
                            title={
                                userPrivs.includes('supprimer_programme_entretien')
                                ? "Supprimer le programme d'entretien"
                                : "Vous n'avez pas le droit d'accéder à cette action"
                            }
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={userPrivs.includes('ajouter_programme_entretien') ? () => handleAddProgramme(type.id_type): undefined}
                          className={`p-2 text-white rounded-md 
                                ${(userPrivs.includes('ajouter_programme_entretien'))
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-400 cursor-not-allowed"}`}
                          disabled={!userPrivs.includes('ajouter_programme_entretien')}
                          title={
                            userPrivs.includes('ajouter_programme_entretien')
                            ? "Ajouter un programme d'entretien"
                            : "Vous n'avez pas le droit d'accéder à cette action"
                        }
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <ChevronLeft className="h-5 w-5 transform rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Program Type Selection Modal */}
      {showProgramTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sélectionner le type de programme</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectProgramType("kilometrage")}
                className="p-4 bg-[#0a2d5e] text-white rounded-md hover:bg-blue-700 flex flex-col items-center justify-center"
              >
                <span className="text-xl font-bold">Kilométrage</span>
                <span className="text-sm mt-2">Programme basé sur les kilomètres</span>
              </button>

              <button
                onClick={() => handleSelectProgramType("heure")}
                className="p-4 bg-[#e6b800] text-[#0a2d5e] rounded-md hover:bg-yellow-500 flex flex-col items-center justify-center"
              >
                <span className="text-xl font-bold">Heures</span>
                <span className="text-sm mt-2">Programme basé sur les heures</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProgramTypeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
