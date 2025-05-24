"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react"

interface Type {
  id_type: number
  designation: string
  id_marque: number
}

interface Marque {
  id_marque: number
  designation: string
}

type SortConfig = {
  key: keyof Type | null
  direction: "asc" | "desc"
}

export default function TypesTable({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const [types, setTypes] = useState<Type[]>([])
  const [filteredTypes, setFilteredTypes] = useState<Type[]>([])
  const [marques, setMarques] = useState<Marque[]>([])
  const [selectedMarque, setSelectedMarque] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isAddingType, setIsAddingType] = useState(false)
  const [newType, setNewType] = useState("")
  const [addingError, setAddingError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit mode states
  const [isEditingType, setIsEditingType] = useState(false)
  const [editTypeId, setEditTypeId] = useState<number | null>(null)
  const [editTypeDesignation, setEditTypeDesignation] = useState("")
  const [editingError, setEditingError] = useState<string | null>(null)

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })

  // Marque dropdown search
  const [marqueSearchTerm, setMarqueSearchTerm] = useState("")
  const [isMarqueDropdownOpen, setIsMarqueDropdownOpen] = useState(false)
  const [filteredMarques, setFilteredMarques] = useState<Marque[]>([])
  const marqueDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marqueDropdownRef.current && !marqueDropdownRef.current.contains(event.target as Node)) {
        setIsMarqueDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter marques based on search
  useEffect(() => {
    if (!marqueSearchTerm.trim()) {
      setFilteredMarques(marques)
    } else {
      const term = marqueSearchTerm.toLowerCase()
      const filtered = marques.filter(
        (marque) => marque.designation.toLowerCase().includes(term) || marque.id_marque.toString().includes(term),
      )
      setFilteredMarques(filtered)
    }
  }, [marqueSearchTerm, marques])

  // Fetch marques on component mount
  useEffect(() => {
    fetchMarques()
  }, [])

  // Fetch types when selected marque changes
  useEffect(() => {
    if (selectedMarque) {
      fetchTypes(Number(selectedMarque))
    } else {
      setTypes([])
      setFilteredTypes([])
      setIsLoading(false)
    }
  }, [selectedMarque])

  // Apply filters and sorting
  useEffect(() => {
    let results = [...types]

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (type) => type.designation.toLowerCase().includes(term) || type.id_type.toString().includes(term),
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      results.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Type]
        const bValue = b[sortConfig.key as keyof Type]

        if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1
        if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredTypes(results)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, types, sortConfig])

  // Handle sorting
  const requestSort = (key: keyof Type) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Type) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 text-gray-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-gray-600" />
    )
  }

  // Fetch marques from API
  const fetchMarques = async () => {
    try {
      const response = await fetch("/api/vehicule/marque")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la récupération des marques")
      }

      const data = await response.json()
      setMarques(data)
      setFilteredMarques(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des marques:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des marques")
    }
  }

  // Fetch types for a specific marque
  const fetchTypes = async (marqueId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/vehicule/type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_marque: marqueId,
          type: "get",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la récupération des types")
      }

      const data = await response.json()
      setTypes(data)
      setFilteredTypes(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des types:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des types")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle adding a new type
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newType.trim()) {
      setAddingError("Veuillez entrer une désignation")
      return
    }

    if (!selectedMarque) {
      setAddingError("Veuillez sélectionner une marque")
      return
    }

    setIsSubmitting(true)
    setAddingError(null)

    try {
      const response = await fetch("/api/vehicule/type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          designation: newType,
          id_marque: Number(selectedMarque),
          type: "ajouter",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'ajout du type")
      }

      // Success - refresh the list and reset form
      fetchTypes(Number(selectedMarque))
      setNewType("")
      setIsAddingType(false)
    } catch (err) {
      console.error("Erreur lors de l'ajout du type:", err)
      setAddingError(err instanceof Error ? err.message : "Erreur lors de l'ajout du type")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle editing a type
  const handleEditType = (type: Type) => {
    setEditTypeId(type.id_type)
    setEditTypeDesignation(type.designation)
    setEditingError(null)
    setIsEditingType(true)
  }

  // Handle submitting the edit form
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editTypeDesignation.trim()) {
      setEditingError("Veuillez entrer une désignation")
      return
    }

    setIsSubmitting(true)
    setEditingError(null)

    try {
      const response = await fetch("/api/vehicule/type", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_type: editTypeId,
          nouvelleDesignation: editTypeDesignation,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la modification du type")
      }

      // Success - refresh the list and reset form
      if (selectedMarque) {
        fetchTypes(Number(selectedMarque))
      }
      setIsEditingType(false)
      setEditTypeId(null)
      setEditTypeDesignation("")
    } catch (err) {
      console.error("Erreur lors de la modification du type:", err)
      setEditingError(err instanceof Error ? err.message : "Erreur lors de la modification du type")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle marque selection
  const handleMarqueSelect = (marqueId: number) => {
    setSelectedMarque(marqueId)
    const selectedMarqueObj = marques.find((m) => m.id_marque === marqueId)
    setMarqueSearchTerm(selectedMarqueObj?.designation || "")
    setIsMarqueDropdownOpen(false)
    setSearchTerm("")
    setCurrentPage(1)
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTypes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get marque name by id
  const getMarqueName = (id: number) => {
    const marque = marques.find((m) => m.id_marque === id)
    return marque ? marque.designation : "Inconnue"
  }

  // Get selected marque name
  const getSelectedMarqueName = () => {
    if (!selectedMarque) return ""
    const marque = marques.find((m) => m.id_marque === Number(selectedMarque))
    return marque ? marque.designation : ""
  }

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with search and add button */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Liste des Types de Véhicules</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Searchable Marque Dropdown */}
              <div className="relative" ref={marqueDropdownRef}>
                <div className="relative cursor-pointer" onClick={() => setIsMarqueDropdownOpen(!isMarqueDropdownOpen)}>
                  <input
                    type="text"
                    placeholder="Sélectionner une marque"
                    value={marqueSearchTerm}
                    onChange={(e) => {
                      setMarqueSearchTerm(e.target.value)
                      setIsMarqueDropdownOpen(true)
                    }}
                    className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isMarqueDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {filteredMarques.length === 0 ? (
                      <div className="text-gray-500 px-4 py-2">Aucune marque trouvée</div>
                    ) : (
                      filteredMarques.map((marque) => (
                        <div
                          key={marque.id_marque}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                            selectedMarque === marque.id_marque ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                          }`}
                          onClick={() => handleMarqueSelect(marque.id_marque)}
                        >
                          <span className="block truncate">{marque.designation}</span>
                          {selectedMarque === marque.id_marque && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-grow md:max-w-xs">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!selectedMarque}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>

              {/* Add Type Button */}
              {userPrivs.includes("ajouter_type") && (
                <button
                  onClick={() => setIsAddingType(true)}
                  disabled={!selectedMarque}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un type
                </button>
              )}

              {/* Refresh Button */}
              <button
                onClick={() => selectedMarque && fetchTypes(Number(selectedMarque))}
                disabled={isLoading || !selectedMarque}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("id_type")}
                >
                  <div className="flex items-center">
                    ID
                    {getSortDirectionIndicator("id_type")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("designation")}
                >
                  <div className="flex items-center">
                    Désignation
                    {getSortDirectionIndicator("designation")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("id_marque")}
                >
                  <div className="flex items-center">
                    Marque
                    {getSortDirectionIndicator("id_marque")}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!selectedMarque ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <ChevronDown className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">Veuillez sélectionner une marque</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Sélectionnez une marque pour afficher ses types de véhicules
                      </p>
                    </div>
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                      <p className="text-lg font-medium">Chargement des types...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <p className="text-lg font-medium text-red-500">Erreur lors du chargement des types</p>
                      <p className="text-sm text-gray-500 mt-1">{error}</p>
                      <button
                        onClick={() => selectedMarque && fetchTypes(Number(selectedMarque))}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Réessayer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Aucun type trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm
                          ? "Essayez de modifier votre recherche"
                          : "Ajoutez des types pour les voir apparaître ici"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Effacer la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((type) => (
                  <tr key={type.id_type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.id_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMarqueName(type.id_marque)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => (userPrivs.includes("modifier_type") ? handleEditType(type) : undefined)}
                        disabled={!userPrivs.includes("modifier_type")}
                        className={`mr-3 inline-flex items-center 
                          ${
                            userPrivs.includes("modifier_type")
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
        {!isLoading && !error && selectedMarque && filteredTypes.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                Affichage de {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTypes.length)} sur{" "}
                {filteredTypes.length} type{filteredTypes.length > 1 ? "s" : ""}
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

        {/* Add Type Modal */}
        {isAddingType && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleAddType}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Ajouter un type</h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingType(false)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Error message */}
                    {addingError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-2">
                            <h3 className="text-xs font-medium text-red-800">Erreur</h3>
                            <div className="mt-1 text-xs text-red-700">
                              <p>{addingError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="marque" className="block text-sm font-medium text-gray-700 mb-1">
                          Marque
                        </label>
                        <input
                          id="marque"
                          name="marque"
                          value={getSelectedMarqueName()}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                          Désignation du type
                        </label>
                        <input
                          id="designation"
                          name="designation"
                          value={newType}
                          onChange={(e) => setNewType(e.target.value)}
                          type="text"
                          placeholder="Entrez le nom du type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newType.trim()}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Ajout en cours...
                        </>
                      ) : (
                        "Ajouter"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingType(false)}
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

        {/* Edit Type Modal */}
        {isEditingType && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Modifier un type</h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingType(false)}
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

                    <div>
                      <label htmlFor="edit-designation" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouvelle désignation du type
                      </label>
                      <input
                        id="edit-designation"
                        name="edit-designation"
                        value={editTypeDesignation}
                        onChange={(e) => setEditTypeDesignation(e.target.value)}
                        type="text"
                        placeholder="Entrez le nouveau nom du type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting || !editTypeDesignation.trim()}
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
                      onClick={() => setIsEditingType(false)}
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
      </div>
    </div>
  )
}
