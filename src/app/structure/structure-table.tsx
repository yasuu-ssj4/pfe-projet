"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  Edit,
  Building2,
  CheckCircle2,
} from "lucide-react"
import FormStruct from "../Utilisateurs/form-struct"

interface Structure {
  code_structure: string
  code_structure_hierachique?: string
  designation: string
  type_structure_hierachique: string
}

export default function StructuresTable({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const [structures, setStructures] = useState<Structure[]>([])
  const [filteredStructures, setFilteredStructures] = useState<Structure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isAddingStructure, setIsAddingStructure] = useState(false)
  const [isEditingStructure, setIsEditingStructure] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [editStructureCode, setEditStructureCode] = useState<string>("")
  const [editStructureDesignation, setEditStructureDesignation] = useState("")
  const [editingError, setEditingError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    visible: boolean
    message: string
    type: "success" | "error"
  }>({ visible: false, message: "", type: "success" })

  // Fetch structures on component mount
  useEffect(() => {
    fetchStructures()
  }, [])

  // Filter structures when search term or type filter changes
  useEffect(() => {
    if (!searchTerm.trim() && !typeFilter) {
      setFilteredStructures(structures)
      return
    }

    let filtered = [...structures]

    if (typeFilter) {
      filtered = filtered.filter((structure) => structure.type_structure_hierachique === typeFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (structure) =>
          structure.designation.toLowerCase().includes(term) ||
          structure.code_structure.toLowerCase().includes(term) ||
          (structure.code_structure_hierachique && structure.code_structure_hierachique.toLowerCase().includes(term)),
      )
    }

    setFilteredStructures(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [searchTerm, typeFilter, structures])

  // Fetch structures from API
  const fetchStructures = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/structure/ajouterStructure")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la récupération des structures")
      }

      const data = await response.json()
      setStructures(data)
      setFilteredStructures(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des structures:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des structures")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle editing a structure
  const handleEditStructure = (structure: Structure) => {
    setEditStructureCode(structure.code_structure)
    setEditStructureDesignation(structure.designation)
    setEditingError(null)
    setIsEditingStructure(true)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editStructureDesignation.trim()) {
      setEditingError("Veuillez entrer une désignation")
      return
    }

    setIsSubmitting(true)
    setEditingError(null)

    try {
      const response = await fetch("/api/structure/ajouterStructure", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_structure: editStructureCode,
          nouvelleDesignation: editStructureDesignation,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la modification de la structure")
      }

      // Success - refresh the list and reset form
      fetchStructures()
      setIsEditingStructure(false)
      setEditStructureCode("")
      setEditStructureDesignation("")

      // Show success notification
      showNotification("Structure modifiée avec succès", "success")
    } catch (err) {
      console.error("Erreur lors de la modification de la structure:", err)
      setEditingError(err instanceof Error ? err.message : "Erreur lors de la modification de la structure")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this function to show notifications
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ visible: true, message, type })
    setTimeout(() => {
      setNotification({ visible: false, message: "", type: "success" })
    }, 5000)
  }

  // Get parent structure designation
  const getParentStructureDesignation = (parentCode: string | undefined) => {
    if (!parentCode) return "N/A"

    const parentStructure = structures.find((s) => s.code_structure === parentCode)
    return parentStructure ? parentStructure.designation : parentCode
  }

  // Get structure type icon
  const getStructureTypeIcon = (type: string) => {
    switch (type) {
      case "Branche":
        return <Building2 className="h-4 w-4 text-purple-600" />
      case "DG":
        return <Building2 className="h-4 w-4 text-red-600" />
      case "District":
        return <Building2 className="h-4 w-4 text-blue-600" />
      case "Centre":
        return <Building2 className="h-4 w-4 text-green-600" />
      case "Service transport":
        return <Building2 className="h-4 w-4 text-orange-600" />
      case "Service Maintenance":
        return <Building2 className="h-4 w-4 text-orange-600" />
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />
    }
  }

  // Get structure type badge color
  const getStructureTypeBadgeColor = (type: string) => {
    switch (type) {
      case "District":
        return "bg-blue-100 text-blue-800"
      case "Centre":
        return "bg-green-100 text-green-800"
      case "Service":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredStructures.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredStructures.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with search and add button */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Liste des Structures</h2>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="Rechercher par code ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les types</option>
                <option value="Branche">Branche</option>
                <option value="District">District</option>
                <option value="Centre">Centre</option>
                <option value="Service transport">Service transport</option>
                <option value="Service maintenance">Service maintenance</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-270" />
              </div>
            </div>

            {/* Add Structure Button */}
            {userPrivs.includes("ajouter_structure") && (
              <button
                onClick={() => setIsAddingStructure(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une structure
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchStructures}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                Désignation
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                Structure Parent
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Chargement des structures...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg font-medium text-red-500">Erreur lors du chargement des structures</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                    <button
                      onClick={fetchStructures}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredStructures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Aucune structure trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm || typeFilter
                        ? "Essayez de modifier votre recherche ou vos filtres"
                        : "Ajoutez des structures pour les voir apparaître ici"}
                    </p>
                    {(searchTerm || typeFilter) && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setTypeFilter("")
                        }}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((structure) => (
                <tr key={structure.code_structure} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {structure.code_structure}
                  </td>
                  <td className="py-4 whitespace-nowrap text-xs text-gray-500">{structure.designation}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {getStructureTypeIcon(structure.type_structure_hierachique)}
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStructureTypeBadgeColor(
                          structure.type_structure_hierachique,
                        )}`}
                      >
                        {structure.type_structure_hierachique}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                    {getParentStructureDesignation(structure.code_structure_hierachique)}
                  </td>
                  <td className=" py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() =>
                        userPrivs.includes("ajouter_structure") ? handleEditStructure(structure) : undefined
                      }
                      disabled={!userPrivs.includes("ajouter_structure")}
                      className={`mr-3 inline-flex items-center 
                        ${
                          userPrivs.includes("ajouter_structure")
                            ? "text-indigo-600 hover:text-indigo-900"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && !error && filteredStructures.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Affichage de {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStructures.length)} sur{" "}
              {filteredStructures.length} structure{filteredStructures.length > 1 ? "s" : ""}
            </div>

            <div className="flex items-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add Structure Modal */}
      {isAddingStructure && (
        <FormStruct
          onClose={() => {
            setIsAddingStructure(false)
            fetchStructures()
          }}
        />
      )}
      {/* Edit Structure Modal */}
      {isEditingStructure && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitEdit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Modifier une structure</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingStructure(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Error message */}
                  {editingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-2">
                          <h3 className="text-xs font-medium text-red-800">Erreur</h3>
                          <div className="mt-1 text-xs text-red-700">
                            <p>{editingError}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Structure Code (Read-only) */}
                    <div>
                      <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-1">
                        Code de structure
                      </label>
                      <input
                        id="edit-code"
                        name="edit-code"
                        value={editStructureCode}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Le code de structure ne peut pas être modifié</p>
                    </div>

                    {/* Structure Designation */}
                    <div>
                      <label htmlFor="edit-designation" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouvelle désignation de la structure
                      </label>
                      <input
                        id="edit-designation"
                        name="edit-designation"
                        value={editStructureDesignation}
                        onChange={(e) => setEditStructureDesignation(e.target.value)}
                        type="text"
                        placeholder="Entrez le nouveau nom de la structure"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting || !editStructureDesignation.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Modification en cours...
                      </>
                    ) : (
                      "Modifier"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingStructure(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.visible && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  )
}
