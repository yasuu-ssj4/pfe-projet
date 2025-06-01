"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { useRouter } from "next/navigation"
import { LoaderIcon } from 'lucide-react'

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

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTypes = filteredTypes.slice(startIndex, endIndex)

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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Generate page numbers to display (same logic as afficherVehicule)
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#e6b800] text-[#0a2d5e] p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-center">PROGRAMME D'ENTRETIEN</h1>
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
              <th className="px-4 py-3 border text-left font-semibold">Type</th>
              <th className="px-4 py-3 border text-left font-semibold">Marque</th>
              <th className="px-4 py-3 border text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <LoaderIcon className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Chargement des programmes d'entretien...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedTypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center border">
                  Aucun type trouvé
                </td>
              </tr>
            ) : (
              paginatedTypes.map((type) => (
                <tr key={type.id_type} className="hover:bg-gray-50">
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

      {/* Advanced Pagination (like afficherVehicule) */}
      {!loading && filteredTypes.length > 0 && totalPages > 1 && (
        <div className="container mx-auto px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1}-{Math.min(endIndex, filteredTypes.length)} sur{" "}
              {filteredTypes.length} programmes d'entretien
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </button>

              <div className="hidden md:flex space-x-2">
                {getPageNumbers().map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span key={`ellipsis-${index}`} className="inline-flex items-center px-3 py-2 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${pageNumber}`}
                      onClick={() => handlePageChange(pageNumber as number)}
                      className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        currentPage === pageNumber
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
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