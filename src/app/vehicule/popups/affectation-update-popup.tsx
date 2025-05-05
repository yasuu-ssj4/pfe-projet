"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Search } from "lucide-react"

interface AffectationUpdatePopupProps {
  isOpen: boolean
  onClose: () => void
  code_vehicule: string
  onUpdate: (params: { code_vehicule: string; code_structure: string }) => Promise<void>
}
interface Struct {
    code_structure: string
    designation: string
}
export default function AffectationUpdatePopup({
  isOpen,
  onClose,
  code_vehicule,
  onUpdate,
}: AffectationUpdatePopupProps) {
  const [code_structure, setCodeStructure] = useState<string>("")
  const [structures, setStructures] = useState<Struct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStructures, setIsLoadingStructures] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // New state variables for enhanced dropdown
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState("")
  const [filteredStructures, setFilteredStructures] = useState<Struct[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter structures based on search term
  useEffect(() => {
    if (structures.length > 0) {
      const filtered = structures.filter(
        (structure) =>
          structure.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          structure.code_structure.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredStructures(filtered)
    }
  }, [searchTerm, structures])

  useEffect(() => {
    const fetchStructures = async () => {
      setIsLoadingStructures(true)
      try {
        const response = await fetch("/api/structure/verifierStructures", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({ type: "Centre" }),
          })
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des structures")
        }
        const data = await response.json()
        console.log("Fetched structures:", data);
        
        setStructures(data)
        setFilteredStructures(data)
      } catch (err) {
        console.error("Error fetching structures:", err)
        setError("Impossible de charger la liste des structures")
      } finally {
        setIsLoadingStructures(false)
      }
    }

    if (isOpen) {
      fetchStructures()
      setCodeStructure("")
      setSelectedStructure("")
      setSearchTerm("")
      setSuccess(false)
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate input
      if (!code_structure) {
        throw new Error("Veuillez sélectionner une structure")
      }

      // Call the update function passed as prop
      if (onUpdate) {
        await onUpdate({
          code_vehicule,
          code_structure,
        })
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Changer l'affectation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Affectation mise à jour avec succès</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="code_vehicule" className="block text-sm font-medium text-gray-700 mb-1">
                Code véhicule
              </label>
              <input
                type="text"
                id="code_vehicule"
                value={code_vehicule}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="text"
                id="date"
                value={new Date().toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
              <p className="mt-1 text-xs text-gray-500">La date actuelle sera utilisée automatiquement</p>
            </div>

            <div>
              <label htmlFor="code_structure" className="block text-sm font-medium text-gray-700 mb-1">
                Structure
              </label>
              <div ref={dropdownRef} className="relative">
                {isLoadingStructures ? (
                  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-gray-500">Chargement...</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        id="structure_search"
                        placeholder="Rechercher une structure"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {showDropdown && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredStructures.length > 0 ? (
                          filteredStructures.map((structure) => (
                            <li
                              key={structure.code_structure}
                              onClick={() => {
                                setCodeStructure(structure.code_structure)
                                setSelectedStructure(structure.designation)
                                setShowDropdown(false)
                              }}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                            >
                              <span className="text-gray-900">{structure.designation}</span>
                              <span className="text-xs text-gray-500">{structure.code_structure}</span>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-center text-gray-500">Aucune structure trouvée</li>
                        )}
                      </ul>
                    )}

                    {selectedStructure && (
                      <div className="mt-2 text-sm text-blue-600">Structure sélectionnée: {selectedStructure}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading || isLoadingStructures || !code_structure}
              >
                {isLoading ? "Mise à jour..." : "Confirmer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
