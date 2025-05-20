"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"

import type { VehicleForm } from "./formVehicules"
import type { Structure } from "@/app/interfaces"
import { AlertCircleIcon, ChevronDownIcon, LoaderIcon, SearchIcon } from "lucide-react"

type StepOneProps = {
  FormValue: VehicleForm
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  SetStep: React.Dispatch<React.SetStateAction<number>>
  SetPopup: React.Dispatch<React.SetStateAction<boolean>>
}

const StepOne: React.FC<StepOneProps> = ({ FormValue, handleChange, SetStep, SetPopup }) => {
  const [genre, setGenre] = useState<any[]>([])
  const [marque, setMarque] = useState<any[]>([])
  const [type, setType] = useState<any[]>([])
  const [dataCentre, setDataCentre] = useState<any[]>([])
  const [showOptions, setShowOptions] = useState(false)
  const [filteredCentre, setFilteredCentre] = useState<any[]>([])
  const [selected, setSelected] = useState<Structure | null>(null)
  const [isLoading, setIsLoading] = useState({
    genres: true,
    marques: true,
    types: false,
    centres: true,
  })
  const [error, setError] = useState<string | null>(null)

  const boxRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
      setShowOptions(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading((prev) => ({ ...prev, genres: true }))
      try {
        const response = await fetch("/api/vehicule/genre", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des genres")
        }

        const data = await response.json()
        setGenre(data)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading((prev) => ({ ...prev, genres: false }))
      }
    }
    fetchGenres()
  }, [])

  // Fetch marques
  useEffect(() => {
    const fetchMarques = async () => {
      setIsLoading((prev) => ({ ...prev, marques: true }))
      try {
        const response = await fetch("/api/vehicule/marque", {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des marques")
        }

        const data = await response.json()
        setMarque(data)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading((prev) => ({ ...prev, marques: false }))
      }
    }
    fetchMarques()
  }, [])

  // Fetch types based on selected marque
  useEffect(() => {
    const fetchTypes = async () => {
      if (!FormValue.code_marque) return

      setIsLoading((prev) => ({ ...prev, types: true }))
      try {
        const response = await fetch("/api/vehicule/type", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "get", id_marque: FormValue.code_marque }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Erreur API:", errorText)
          throw new Error("Erreur lors de la récupération des types")
        }

        const data = await response.json()
        setType(data)
           if (data.length > 0) {
          // If we're in edit mode, keep the existing type if it's in the list
         
            const existingType = data.find((t: any) => t.id_type === FormValue.code_type)
            if (!existingType && data.length > 0) {
     
              FormValue.code_type = data[0].id_type
            
          } else {
            // In create mode, always set to the first type
            FormValue.code_type = data[0].id_type
            console.log(FormValue.code_type);
            
          }
        }
      } catch (err) {
        console.error("Erreur dans fetchTypes ⚠️:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading((prev) => ({ ...prev, types: false }))
      }
    }
    fetchTypes()
  }, [FormValue.code_marque])

  // Fetch centres
  useEffect(() => {
    const fetchCentres = async () => {
      setIsLoading((prev) => ({ ...prev, centres: true }))
      try {
        const response = await fetch("/api/structure/verifierStructures", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ type: "Centre" }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des centres")
        }

        const data = await response.json()
        setDataCentre(data)
      } catch (err) {
        console.error("Erreur:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading((prev) => ({ ...prev, centres: false }))
      }
    }
    fetchCentres()
  }, [])

  
  useEffect(() => {
    const filtered = dataCentre.filter((item) =>
      item.designation.toLowerCase().includes(FormValue.code_structure.toLowerCase()),
    )
    setFilteredCentre(filtered)
  }, [FormValue.code_structure, dataCentre])

  const handleSelect = (option: Structure) => {
    setSelected(option)
    FormValue.code_structure = option.code_structure
    setShowOptions(false)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="code_genre" className="block text-sm font-medium text-gray-700 mb-1">
            Genre
          </label>
          <div className="relative">
            {isLoading.genres ? (
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                <span className="text-gray-500">Chargement...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="code_genre"
                  name="code_genre"
                  onChange={handleChange}
                  value={FormValue.code_genre}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  {genre.map((option) => (
                    <option key={option.code_genre} value={option.code_genre}>
                      {option.designation}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="code_marque" className="block text-sm font-medium text-gray-700 mb-1">
            Marque
          </label>
          <div className="relative">
            {isLoading.marques ? (
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                <span className="text-gray-500">Chargement...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="code_marque"
                  name="code_marque"
                  onChange={handleChange}
                  value={FormValue.code_marque}
                  className="block w-full pl-3 pr-10 py-2 text-base border appearance-none border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  {marque.map((option) => (
                    <option key={option.id_marque} value={option.id_marque}>
                      {option.designation}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="code_type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="relative">
            {isLoading.types ? (
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                <span className="text-gray-500">Chargement...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="code_type"
                  name="code_type"
                  onChange={handleChange}
                  value={FormValue.code_type}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  {type.length > 0 ? (
                    type.map((option) => (
                      <option key={option.id_type} value={option.id_type}>
                        {option.designation}
                      </option>
                    ))
                  ) : (
                    <option value="">Sélectionnez d'abord une marque</option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="code_structure" className="block text-sm font-medium text-gray-700 mb-1">
            Structure
          </label>
          <div ref={boxRef} className="relative">
            {isLoading.centres ? (
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                <span className="text-gray-500">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    id="code_structure"
                    name="code_structure"
                    placeholder="Rechercher par désignation de structure"
                    onFocus={() => setShowOptions(true)}
                    onChange={handleChange}
                    value={FormValue.code_structure}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {showOptions && filteredCentre.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCentre.map((option) => (
                      <li
                        key={option.code_structure}
                        onClick={() => handleSelect(option)}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                      >
                        <span>{option.designation}</span>
                        <span className="text-xs text-gray-500">{option.code_structure}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {showOptions && filteredCentre.length === 0 && FormValue.code_structure && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                    Aucune structure trouvée
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetPopup(false)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => {SetStep(2), console.log(FormValue.code_type)}}
          disabled={
            !FormValue.code_structure || isLoading.genres || isLoading.marques || isLoading.types || isLoading.centres
          }
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default StepOne
