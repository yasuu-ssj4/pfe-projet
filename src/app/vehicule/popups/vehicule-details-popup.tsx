"use client"

import { useState, useEffect } from "react"
import { LoaderIcon, X } from "lucide-react"

type VehiculeDetails = {
  code_vehicule: string
  code_genre: string
  designation_genre: string
  code_type: string
  designation_type: string
  unite_predication: string
  n_immatriculation: string
  n_serie: string
  date_acquisition: string | null
  prix_acquisition: number | null
  n_inventaire: string | undefined
  date_debut_assurance: string | null
  date_fin_assurance: string | null
  date_debut_controle_technique: string | null
  date_fin_controle_technique: string | null
  date_debut_atmd: string | null
  date_fin_atmd: string | null
  date_debut_permis_circuler: string | null
  date_fin_permis_circuler: string | null
  date_debut_certificat: string | null
  date_fin_certificat: string | null
}

type VehiculeDetailsPopupProps = {
  isOpen: boolean
  onClose: () => void
  code_vehicule: string
}

export default function VehiculeDetailsPopup({ isOpen, onClose, code_vehicule }: VehiculeDetailsPopupProps) {
  const [vehiculeDetails, setVehiculeDetails] = useState<VehiculeDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && code_vehicule) {
      fetchVehiculeDetails(code_vehicule)
    }
  }, [isOpen, code_vehicule])

  const fetchVehiculeDetails = async (code_vehicule: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/vehicule/getVehiculeInfos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des informations du véhicule")
      }

      const data = await res.json()
      setVehiculeDetails(data.vehicule)
    } catch (error) {
      console.error("Error fetching vehicle details:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  // Format date to display in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Check if a document is expired
  const isExpired = (dateString: string | null) => {
    if (!dateString) return false
    const expiryDate = new Date(dateString)
    const today = new Date()
    return expiryDate < today
  }

  // Check if a document is about to expire (within 30 days)
  const isAboutToExpire = (dateString: string | null) => {
    if (!dateString) return false
    const expiryDate = new Date(dateString)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return expiryDate > today && expiryDate <= thirtyDaysFromNow
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Détails du véhicule</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoaderIcon className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="ml-2 text-gray-600">Chargement des détails...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchVehiculeDetails(code_vehicule)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                Réessayer
              </button>
            </div>
          ) : vehiculeDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Informations de base
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Code véhicule</p>
                    <p className="font-medium">{vehiculeDetails.code_vehicule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Immatriculation</p>
                    <p className="font-medium">{vehiculeDetails.n_immatriculation || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="font-medium">{vehiculeDetails.designation_genre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{vehiculeDetails.designation_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de série</p>
                    <p className="font-medium">{vehiculeDetails.n_serie || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unité de prédication</p>
                    <p className="font-medium">{vehiculeDetails.unite_predication || "Non spécifié"}</p>
                  </div>
                </div>
              </div>

              {/* Acquisition Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Informations d'acquisition
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date d'acquisition</p>
                    <p className="font-medium">{formatDate(vehiculeDetails.date_acquisition)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prix d'acquisition</p>
                    <p className="font-medium">
                      {vehiculeDetails.prix_acquisition
                        ? `${vehiculeDetails.prix_acquisition.toLocaleString()} DA`
                        : "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro d'inventaire</p>
                    <p className="font-medium">{vehiculeDetails.n_inventaire || "Non spécifié"}</p>
                  </div>
                </div>
              </div>

              {/* Documents and Expiry Dates */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Documents et dates d'expiration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Insurance */}
                  <div className="border rounded-md p-3">
                    <h5 className="font-medium mb-2">Assurance</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium">{formatDate(vehiculeDetails.date_debut_assurance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p
                          className={`font-medium ${
                            isExpired(vehiculeDetails.date_fin_assurance)
                              ? "text-red-600"
                              : isAboutToExpire(vehiculeDetails.date_fin_assurance)
                                ? "text-amber-600"
                                : ""
                          }`}
                        >
                          {formatDate(vehiculeDetails.date_fin_assurance)}
                          {isExpired(vehiculeDetails.date_fin_assurance) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Expiré
                            </span>
                          )}
                          {isAboutToExpire(vehiculeDetails.date_fin_assurance) && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Bientôt expiré
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Control */}
                  <div className="border rounded-md p-3">
                    <h5 className="font-medium mb-2">Contrôle technique</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium">{formatDate(vehiculeDetails.date_debut_controle_technique)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p
                          className={`font-medium ${
                            isExpired(vehiculeDetails.date_fin_controle_technique)
                              ? "text-red-600"
                              : isAboutToExpire(vehiculeDetails.date_fin_controle_technique)
                                ? "text-amber-600"
                                : ""
                          }`}
                        >
                          {formatDate(vehiculeDetails.date_fin_controle_technique)}
                          {isExpired(vehiculeDetails.date_fin_controle_technique) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Expiré
                            </span>
                          )}
                          {isAboutToExpire(vehiculeDetails.date_fin_controle_technique) && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Bientôt expiré
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ATMD */}
                  <div className="border rounded-md p-3">
                    <h5 className="font-medium mb-2">ATMD</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium">{formatDate(vehiculeDetails.date_debut_atmd)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p
                          className={`font-medium ${
                            isExpired(vehiculeDetails.date_fin_atmd)
                              ? "text-red-600"
                              : isAboutToExpire(vehiculeDetails.date_fin_atmd)
                                ? "text-amber-600"
                                : ""
                          }`}
                        >
                          {formatDate(vehiculeDetails.date_fin_atmd)}
                          {isExpired(vehiculeDetails.date_fin_atmd) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Expiré
                            </span>
                          )}
                          {isAboutToExpire(vehiculeDetails.date_fin_atmd) && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Bientôt expiré
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Circulation Permit */}
                  <div className="border rounded-md p-3">
                    <h5 className="font-medium mb-2">Permis de circuler</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium">{formatDate(vehiculeDetails.date_debut_permis_circuler)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p
                          className={`font-medium ${
                            isExpired(vehiculeDetails.date_fin_permis_circuler)
                              ? "text-red-600"
                              : isAboutToExpire(vehiculeDetails.date_fin_permis_circuler)
                                ? "text-amber-600"
                                : ""
                          }`}
                        >
                          {formatDate(vehiculeDetails.date_fin_permis_circuler)}
                          {isExpired(vehiculeDetails.date_fin_permis_circuler) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Expiré
                            </span>
                          )}
                          {isAboutToExpire(vehiculeDetails.date_fin_permis_circuler) && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Bientôt expiré
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate */}
                  <div className="border rounded-md p-3">
                    <h5 className="font-medium mb-2">Certificat</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium">{formatDate(vehiculeDetails.date_debut_certificat)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p
                          className={`font-medium ${
                            isExpired(vehiculeDetails.date_fin_certificat)
                              ? "text-red-600"
                              : isAboutToExpire(vehiculeDetails.date_fin_certificat)
                                ? "text-amber-600"
                                : ""
                          }`}
                        >
                          {formatDate(vehiculeDetails.date_fin_certificat)}
                          {isExpired(vehiculeDetails.date_fin_certificat) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Expiré
                            </span>
                          )}
                          {isAboutToExpire(vehiculeDetails.date_fin_certificat) && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Bientôt expiré
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Aucune information disponible</div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
