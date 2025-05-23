"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, Search, X, Edit } from "lucide-react"

interface Marque {
  id_marque: number
  designation: string
}

export default function MarquesTable({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const [marques, setMarques] = useState<Marque[]>([])
  const [filteredMarques, setFilteredMarques] = useState<Marque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isAddingMarque, setIsAddingMarque] = useState(false)
  const [newMarque, setNewMarque] = useState("")
  const [addingError, setAddingError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit mode states
  const [isEditingMarque, setIsEditingMarque] = useState(false)
  const [editMarqueId, setEditMarqueId] = useState<number | null>(null)
  const [editMarqueDesignation, setEditMarqueDesignation] = useState("")
  const [editingError, setEditingError] = useState<string | null>(null)

  // Fetch marques from API
  const fetchMarques = async () => {
    setIsLoading(true)
    setError(null)

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
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch marques on component mount
  useEffect(() => {
    fetchMarques()
  }, [])

  // Filter marques when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMarques(marques)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = marques.filter(
      (marque) => marque.designation.toLowerCase().includes(term) || marque.id_marque.toString().includes(term),
    )

    setFilteredMarques(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [searchTerm, marques])

  // Handle adding a new marque
  const handleAddMarque = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMarque.trim()) {
      setAddingError("Veuillez entrer une désignation")
      return
    }

    setIsSubmitting(true)
    setAddingError(null)

    try {
      const response = await fetch("/api/vehicule/marque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ designation: newMarque }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'ajout de la marque")
      }

      // Success - refresh the list and reset form
      fetchMarques()
      setNewMarque("")
      setIsAddingMarque(false)
    } catch (err) {
      console.error("Erreur lors de l'ajout de la marque:", err)
      setAddingError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la marque")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle editing a marque
  const handleEditMarque = (marque: Marque) => {
    setEditMarqueId(marque.id_marque)
    setEditMarqueDesignation(marque.designation)
    setEditingError(null)
    setIsEditingMarque(true)
  }

  // Handle submitting the edit form
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editMarqueDesignation.trim()) {
      setEditingError("Veuillez entrer une désignation")
      return
    }

    setIsSubmitting(true)
    setEditingError(null)

    try {
      const response = await fetch("/api/vehicule/marque", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_marque: editMarqueId,
          nouvelleDesignation: editMarqueDesignation,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la modification de la marque")
      }

      // Success - refresh the list and reset form
      fetchMarques()
      setIsEditingMarque(false)
      setEditMarqueId(null)
      setEditMarqueDesignation("")
    } catch (err) {
      console.error("Erreur lors de la modification de la marque:", err)
      setEditingError(err instanceof Error ? err.message : "Erreur lors de la modification de la marque")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMarques.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMarques.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with search and add button */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Liste des Marques</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow md:max-w-xs">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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

              {/* Add Marque Button */}
              {userPrivs.includes("ajouter_marque") && (
                <button
                  onClick={() => setIsAddingMarque(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une marque
                </button>
              )}

              {/* Refresh Button */}
              <button
                onClick={fetchMarques}
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
                  Désignation
                </th>
                <th scope="col" className="px-6 py-3 text-left font-medium text-bold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                      <p className="text-lg font-medium">Chargement des marques...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <p className="text-lg font-medium text-red-500">Erreur lors du chargement des marques</p>
                      <p className="text-sm text-gray-500 mt-1">{error}</p>
                      <button
                        onClick={fetchMarques}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Réessayer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredMarques.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Aucune marque trouvée</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm
                          ? "Essayez de modifier votre recherche"
                          : "Ajoutez des marques pour les voir apparaître ici"}
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
                currentItems.map((marque) => (
                  <tr key={marque.id_marque} className="hover:bg-gray-50">
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{marque.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => (userPrivs.includes("modifier_user") ? handleEditMarque(marque) : undefined)}
                        disabled={!userPrivs.includes("modifier_user")}
                        className={`mr-3 inline-flex items-center 
                          ${
                            userPrivs.includes("modifier_user")
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
        {!isLoading && !error && filteredMarques.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                Affichage de {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMarques.length)} sur{" "}
                {filteredMarques.length} marque{filteredMarques.length > 1 ? "s" : ""}
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

        {/* Add Marque Modal */}
        {isAddingMarque && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleAddMarque}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Ajouter une marque</h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingMarque(false)}
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

                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                        Désignation de la marque
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        value={newMarque}
                        onChange={(e) => setNewMarque(e.target.value)}
                        type="text"
                        placeholder="Entrez le nom de la marque"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newMarque.trim()}
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
                      onClick={() => setIsAddingMarque(false)}
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

        {/* Edit Marque Modal */}
        {isEditingMarque && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Modifier une marque</h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingMarque(false)}
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
                        Nouvelle désignation de la marque
                      </label>
                      <input
                        id="edit-designation"
                        name="edit-designation"
                        value={editMarqueDesignation}
                        onChange={(e) => setEditMarqueDesignation(e.target.value)}
                        type="text"
                        placeholder="Entrez le nouveau nom de la marque"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting || !editMarqueDesignation.trim()}
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
                      onClick={() => setIsEditingMarque(false)}
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
