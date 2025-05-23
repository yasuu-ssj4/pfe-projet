"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Loader2, X, CheckCircle } from "lucide-react"
import type { VehicleForm } from "../formVehicules"
import type { Vehicule } from "@/app/interfaces"

interface ModificationPopupProps {
  isOpen: boolean
  onClose: () => void
  code_vehicule: string
  onUpdate: () => void
}

export default function ModificationPopup({ isOpen, onClose, code_vehicule, onUpdate }: ModificationPopupProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [vehiculeData, setVehiculeData] = useState<any>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [formValue, setFormValue] = useState<VehicleForm>({
    code_vehicule: "",
    code_genre: "A",
    code_marque: 1,
    code_type: 1,
    unite_predication: "Kilometrage",
    kilo_parcouru_heure_fonctionnement: 0,
    code_status: "OPR",
    code_structure: "",
    n_immatriculation: "",
    n_serie: "",
    date_acquisition: "",
    prix_acquisition: null,
    n_inventaire: "",
    date_debut_assurance: "",
    date_fin_assurance: "",
    date_debut_controle_technique: "",
    date_fin_controle_technique: "",
    date_debut_atmd: "",
    date_fin_atmd: "",
    date_debut_permis_circuler: "",
    date_fin_permis_circuler: "",
    date_debut_certificat: "",
    date_fin_certificat: "",
  })

  // Fetch vehicle data when the popup is opened
  useEffect(() => {
    if (isOpen && code_vehicule) {
      fetchVehiculeData()
    }
  }, [isOpen, code_vehicule])

  // Add this useEffect after the existing useEffect for fetching data
  useEffect(() => {
    if (isOpen) {
      setStep(1) // Reset to step 1 when popup opens
      setError(null)
      setSuccess(null)
      setShowSuccessNotification(false)
    }
  }, [isOpen])

  const fetchVehiculeData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/vehicule/getVehiculeInfos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des informations du véhicule")
      }

      const data = await response.json()
      setVehiculeData(data.vehicule)

      // Get the marque_id from the type
      const typeResponse = await fetch("/api/vehicule/type/getMarqueFromType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_type: data.vehicule.code_type }),
      })

      if (!typeResponse.ok) {
        throw new Error("Erreur lors de la récupération de la marque")
      }

      const typeData = await typeResponse.json()
      const marqueId = typeData.id_marque || 1

      // Get the structure
      const structureResponse = await fetch("/api/vehicule/affectation/getAffectation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_vehicule }),
      })

      let structureCode = ""
      if (structureResponse.ok) {
        const structureData = await structureResponse.json()
        structureCode = structureData.code_structure || ""
      }

      // Get the status
      const statusResponse = await fetch("/api/vehicule/status/getStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_vehicule }),
      })

      let statusCode = "OPR"
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        statusCode = statusData.code_status || "OPR"
      }

      // Format dates for form inputs
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().split("T")[0]
      }

      // Set form values
      setFormValue({
        code_vehicule: data.vehicule.code_vehicule,
        code_genre: data.vehicule.code_genre,
        code_marque: marqueId,
        code_type: data.vehicule.code_type,
        unite_predication: data.vehicule.unite_predication,
        kilo_parcouru_heure_fonctionnement: 0, // This will be disabled
        code_status: statusCode, // This will be disabled
        code_structure: structureCode, // This will be disabled
        n_immatriculation: data.vehicule.n_immatriculation || "",
        n_serie: data.vehicule.n_serie || "",
        date_acquisition: formatDateForInput(data.vehicule.date_acquisition),
        prix_acquisition: data.vehicule.prix_acquisition,
        n_inventaire: data.vehicule.n_inventaire || "",
        date_debut_assurance: formatDateForInput(data.vehicule.date_debut_assurance),
        date_fin_assurance: formatDateForInput(data.vehicule.date_fin_assurance),
        date_debut_controle_technique: formatDateForInput(data.vehicule.date_debut_controle_technique),
        date_fin_controle_technique: formatDateForInput(data.vehicule.date_fin_controle_technique),
        date_debut_atmd: formatDateForInput(data.vehicule.date_debut_atmd),
        date_fin_atmd: formatDateForInput(data.vehicule.date_fin_atmd),
        date_debut_permis_circuler: formatDateForInput(data.vehicule.date_debut_permis_circuler),
        date_fin_permis_circuler: formatDateForInput(data.vehicule.date_fin_permis_circuler),
        date_debut_certificat: formatDateForInput(data.vehicule.date_debut_certificat),
        date_fin_certificat: formatDateForInput(data.vehicule.date_fin_certificat),
      })
    } catch (err) {
      console.error("Error fetching vehicle data:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Don't update these fields
    if (
      name === "code_vehicule" ||
      name === "code_status" ||
      name === "kilo_parcouru_heure_fonctionnement" ||
      name === "code_structure"
    ) {
      return
    }

    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function cleanAndConvert<T extends Record<string, any>>(
    data: T,
    dateKeys: (keyof T)[],
    formatDates = false,
  ): { [K in keyof T]: T[K] | null | Date | string } {
    const cleaned = {} as { [K in keyof T]: T[K] | null | Date | string }

    for (const key in data) {
      const value = data[key]

      if (value === "") {
        cleaned[key] = null
        continue
      }

      if (dateKeys.includes(key)) {
        const dateObj = new Date(value)
        if (!isNaN(dateObj.getTime())) {
          cleaned[key] = formatDates ? formatDateDDMMYYYY(dateObj) : dateObj
          continue
        }
      }

      cleaned[key] = value
    }

    return cleaned
  }

  function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const cleanedForm = cleanAndConvert(
        formValue,
        [
          "date_debut_assurance",
          "date_fin_assurance",
          "date_debut_permis_circuler",
          "date_fin_permis_circuler",
          "date_debut_controle_technique",
          "date_fin_controle_technique",
          "date_debut_atmd",
          "date_fin_atmd",
          "date_debut_certificat",
          "date_fin_certificat",
          "date_acquisition",
        ],
        false,
      )

      const vehiculeToUpdate: Vehicule = {
        code_vehicule: formValue.code_vehicule,
        code_genre: formValue.code_genre,
        code_type: Number(formValue.code_type),
        unite_predication: formValue.unite_predication,
        n_immatriculation: formValue.n_immatriculation,
        n_serie: formValue.n_serie,
        prix_acquisition: formValue.prix_acquisition,
        n_inventaire: formValue.n_inventaire,
        date_acquisition:
          cleanedForm.date_acquisition instanceof Date
            ? cleanedForm.date_acquisition
            : cleanedForm.date_acquisition
              ? new Date(cleanedForm.date_acquisition)
              : null,
        date_debut_assurance:
          cleanedForm.date_debut_assurance instanceof Date
            ? cleanedForm.date_debut_assurance
            : cleanedForm.date_debut_assurance
              ? new Date(cleanedForm.date_debut_assurance)
              : null,
        date_fin_assurance:
          cleanedForm.date_fin_assurance instanceof Date
            ? cleanedForm.date_fin_assurance
            : cleanedForm.date_fin_assurance
              ? new Date(cleanedForm.date_fin_assurance)
              : null,
        date_debut_controle_technique:
          cleanedForm.date_debut_controle_technique instanceof Date
            ? cleanedForm.date_debut_controle_technique
            : cleanedForm.date_debut_controle_technique
              ? new Date(cleanedForm.date_debut_controle_technique)
              : null,
        date_fin_controle_technique:
          cleanedForm.date_fin_controle_technique instanceof Date
            ? cleanedForm.date_fin_controle_technique
            : cleanedForm.date_fin_controle_technique
              ? new Date(cleanedForm.date_fin_controle_technique)
              : null,
        date_debut_atmd:
          cleanedForm.date_debut_atmd instanceof Date
            ? cleanedForm.date_debut_atmd
            : cleanedForm.date_debut_atmd
              ? new Date(cleanedForm.date_debut_atmd)
              : null,
        date_fin_atmd:
          cleanedForm.date_fin_atmd instanceof Date
            ? cleanedForm.date_fin_atmd
            : cleanedForm.date_fin_atmd
              ? new Date(cleanedForm.date_fin_atmd)
              : null,
        date_debut_permis_circuler:
          cleanedForm.date_debut_permis_circuler instanceof Date
            ? cleanedForm.date_debut_permis_circuler
            : cleanedForm.date_debut_permis_circuler
              ? new Date(cleanedForm.date_debut_permis_circuler)
              : null,
        date_fin_permis_circuler:
          cleanedForm.date_fin_permis_circuler instanceof Date
            ? cleanedForm.date_fin_permis_circuler
            : cleanedForm.date_fin_permis_circuler
              ? new Date(cleanedForm.date_fin_permis_circuler)
              : null,
        date_debut_certificat:
          cleanedForm.date_debut_certificat instanceof Date
            ? cleanedForm.date_debut_certificat
            : cleanedForm.date_debut_certificat
              ? new Date(cleanedForm.date_debut_certificat)
              : null,
        date_fin_certificat:
          cleanedForm.date_fin_certificat instanceof Date
            ? cleanedForm.date_fin_certificat
            : cleanedForm.date_fin_certificat
              ? new Date(cleanedForm.date_fin_certificat)
              : null,
      }

      // Update vehicle
      const response = await fetch("/api/vehicule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehiculeToUpdate),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur serveur ${response.status}: ${errorText}`)
      }

      // Show success notification
      setShowSuccessNotification(true)

      // Refresh the vehicle list
      onUpdate()

      // Close the popup after showing the notification for 2 seconds
      setTimeout(() => {
        setShowSuccessNotification(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-[60] max-w-sm w-full">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Succès</h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>Véhicule mis à jour avec succès!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 md:mx-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isLoading ? "Chargement des données..." : "Modifier le véhicule"}
              {step === 1 && " - Informations générales"}
              {step === 2 && " - Détails du véhicule"}
              {step === 3 && " - État et statut"}
              {step === 4 && " - Documents de bord"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className={step >= 1 ? "text-indigo-600 font-medium" : ""}>Étape 1</span>
              <span className={step >= 2 ? "text-indigo-600 font-medium" : ""}>Étape 2</span>
              <span className={step >= 3 ? "text-indigo-600 font-medium" : ""}>Étape 3</span>
              <span className={step >= 4 ? "text-indigo-600 font-medium" : ""}>Étape 4</span>
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="p-6 flex justify-center items-center">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mr-2" />
              <span>Chargement des données du véhicule...</span>
            </div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
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

              {/* Success message */}
              {success && (
                <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Succès</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6">
                {step === 1 && (
                  <StepOneModification
                    FormValue={formValue}
                    handleChange={handleChange}
                    SetStep={setStep}
                    SetPopup={onClose}
                    isModification={true}
                  />
                )}
                {step === 2 && (
                  <StepTwoModification
                    FormValue={formValue}
                    handleChange={handleChange}
                    SetStep={setStep}
                    SetFormValue={setFormValue}
                    isModification={true}
                  />
                )}
                {step === 3 && (
                  <StepThreeModification
                    FormValue={formValue}
                    handleChange={handleChange}
                    SetStep={setStep}
                    SetFormValue={setFormValue}
                    isModification={true}
                  />
                )}
                {step === 4 && (
                  <div>
                    <StepFourModification
                      FormValue={formValue}
                      SetStep={setStep}
                      SetFormValue={setFormValue}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// Modified StepOne component for modification
function StepOneModification({ FormValue, handleChange, SetStep, SetPopup, isModification }: any) {
  const [genre, setGenre] = useState<any[]>([])
  const [marque, setMarque] = useState<any[]>([])
  const [type, setType] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState({
    genres: true,
    marques: true,
    types: false,
  })
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
        console.error("Erreur dans fetchTypes ⚠️:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading((prev) => ({ ...prev, types: false }))
      }
    }
    fetchTypes()
  }, [FormValue.code_marque])

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
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
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
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
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
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
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
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
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="code_structure" className="block text-sm font-medium text-gray-700 mb-1">
            Structure (non modifiable)
          </label>
          <input
            type="text"
            id="code_structure"
            name="code_structure"
            value={FormValue.code_structure}
            disabled
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
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
          onClick={() => SetStep(2)}
          disabled={isLoading.genres || isLoading.marques || isLoading.types}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

// Modified StepTwo component for modification
function StepTwoModification({ FormValue, handleChange, SetStep, SetFormValue, isModification }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="code_vehicule" className="block text-sm font-medium text-gray-700 mb-1">
            Code du véhicule (non modifiable)
          </label>
          <input
            id="code_vehicule"
            name="code_vehicule"
            value={FormValue.code_vehicule}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="n_immatriculation" className="block text-sm font-medium text-gray-700 mb-1">
            Matricule
          </label>
          <input
            id="n_immatriculation"
            name="n_immatriculation"
            onChange={handleChange}
            value={FormValue.n_immatriculation}
            placeholder="Matricule du véhicule"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="n_serie" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de série
          </label>
          <input
            id="n_serie"
            name="n_serie"
            onChange={handleChange}
            value={FormValue.n_serie}
            placeholder="N° série"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="n_inventaire" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro inventaire
          </label>
          <input
            id="n_inventaire"
            name="n_inventaire"
            onChange={handleChange}
            value={FormValue.n_inventaire}
            placeholder="N° inventaire"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="prix_acquisition" className="block text-sm font-medium text-gray-700 mb-1">
            Prix d'acquisition
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">DA</span>
            </div>
            <input
              id="prix_acquisition"
              name="prix_acquisition"
              type="number"
              min={1}
              onChange={(e) =>
                SetFormValue({
                  ...FormValue,
                  prix_acquisition: e.target.value === "" ? null : Number.parseFloat(e.target.value),
                })
              }
              value={FormValue.prix_acquisition ?? ""}
              placeholder="Prix"
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date_acquisition" className="block text-sm font-medium text-gray-700 mb-1">
            Date d'acquisition
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="date_acquisition"
              name="date_acquisition"
              type="date"
              value={FormValue.date_acquisition ?? ""}
              onChange={(e) => SetFormValue({ ...FormValue, date_acquisition: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(1)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => SetStep(3)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

// Modified StepThree component for modification
function StepThreeModification({ FormValue, handleChange, SetStep, SetFormValue, isModification }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="unite_predication" className="block text-sm font-medium text-gray-700 mb-1">
            Unité de prédication
          </label>
          <div className="relative">
            <select
              id="unite_predication"
              name="unite_predication"
              onChange={handleChange}
              value={FormValue.unite_predication}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option>Kilometrage</option>
              <option>Heure de fonctionnement</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="kilo_parcouru_heure_fonctionnement" className="block text-sm font-medium text-gray-700 mb-1">
            {FormValue.unite_predication === "Kilometrage"
              ? "Nombre de kilomètres parcourus (non modifiable)"
              : "Nombre d'heures de fonctionnement (non modifiable)"}
          </label>
          <input
            id="kilo_parcouru_heure_fonctionnement"
            name="kilo_parcouru_heure_fonctionnement"
            value="Utilisez la fonction 'MAJ kilométrage/heure'"
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="code_status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut du véhicule (non modifiable)
          </label>
          <input
            id="code_status"
            name="code_status"
            value={`${FormValue.code_status} - Utilisez la fonction 'Changer le statut'`}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(2)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => SetStep(4)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

// Modified StepFour component for modification
function StepFourModification({ FormValue, SetStep, SetFormValue, isSubmitting }: any) {
  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    SetFormValue({ ...FormValue, [name]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Documents de bord</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assurance */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Assurance</h4>
          <div>
            <label htmlFor="date_debut_assurance" className="block text-sm font-medium text-gray-700 mb-1">
              Date début assurance
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_debut_assurance"
                name="date_debut_assurance"
                type="date"
                value={FormValue.date_debut_assurance ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_assurance" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin assurance
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_fin_assurance"
                name="date_fin_assurance"
                type="date"
                value={FormValue.date_fin_assurance ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contrôle technique */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Contrôle technique</h4>
          <div>
            <label htmlFor="date_debut_controle_technique" className="block text-sm font-medium text-gray-700 mb-1">
              Date début contrôle technique
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_debut_controle_technique"
                name="date_debut_controle_technique"
                type="date"
                value={FormValue.date_debut_controle_technique ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_controle_technique" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin contrôle technique
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_fin_controle_technique"
                name="date_fin_controle_technique"
                type="date"
                value={FormValue.date_fin_controle_technique ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Permis de circuler */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Permis de circuler</h4>
          <div>
            <label htmlFor="date_debut_permis_circuler" className="block text-sm font-medium text-gray-700 mb-1">
              Date début du permis de circuler
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_debut_permis_circuler"
                name="date_debut_permis_circuler"
                type="date"
                value={FormValue.date_debut_permis_circuler ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_permis_circuler" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin du permis de circuler
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_fin_permis_circuler"
                name="date_fin_permis_circuler"
                type="date"
                value={FormValue.date_fin_permis_circuler ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ATMD */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Transport de matériel dangereux</h4>
          <div>
            <label htmlFor="date_debut_atmd" className="block text-sm font-medium text-gray-700 mb-1">
              Date début ATMD
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_debut_atmd"
                name="date_debut_atmd"
                type="date"
                value={FormValue.date_debut_atmd ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_atmd" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin ATMD
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="date_fin_atmd"
                name="date_fin_atmd"
                type="date"
                value={FormValue.date_fin_atmd ?? ""}
                onChange={handleDate}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificat conditionnel */}
      {["F", "S", "E", "R"].includes(FormValue.code_genre) && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">
            {["F", "S"].includes(FormValue.code_genre) ? "Certificat réepreuve" : "Certificat baremage"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date_debut_certificat" className="block text-sm font-medium text-gray-700 mb-1">
                Date début certificat
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="date_debut_certificat"
                  name="date_debut_certificat"
                  type="date"
                  value={FormValue.date_debut_certificat ?? ""}
                  onChange={handleDate}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="date_fin_certificat" className="block text-sm font-medium text-gray-700 mb-1">
                Date fin certificat
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="date_fin_certificat"
                  name="date_fin_certificat"
                  type="date"
                  value={FormValue.date_fin_certificat ?? ""}
                  onChange={handleDate}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(3)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Confirmer"
          )}
        </button>
      </div>
    </div>
  )
}
