"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangleIcon, CarIcon, ClockIcon, LoaderIcon, RefreshCwIcon, FileTextIcon } from "lucide-react"
import KilometrageUpdatePopup from "../vehicule/popups/kilometrage-update-popup"

type VehiculeAlerte = {
  code_vehicule: string
  n_immatriculation: string
  marque_designation: string
  type_designation: string
  derniere_mise_a_jour: string | null
  jours_depuis_maj: number
}

type DocumentAlerte = {
  code_vehicule: string
  n_immatriculation: string
  marque_designation: string
  type_designation: string
  document_type: string
  date_fin: string
  jours_restants: number
}

type Props = {
  userId: number
}

export default function DashboardPage({ userId }: Props) {
  const router = useRouter()
  const documentLoadingStarted = useRef(false)

  // State for kilometrage alerts
  const [vehiculesAlertes, setVehiculesAlertes] = useState<VehiculeAlerte[]>([])
  const [isLoadingKilometrage, setIsLoadingKilometrage] = useState(true)
  const [kilometrageError, setKilometrageError] = useState<string | null>(null)

  // State for document alerts
  const [documentsAlertes, setDocumentsAlertes] = useState<DocumentAlerte[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false) // Start as false to hide loading indicator
  const [documentError, setDocumentError] = useState<string | null>(null)

  // Popup state
  const [isKilometragePopupOpen, setIsKilometragePopupOpen] = useState(false)
  const [selectedVehicleForPopup, setSelectedVehicleForPopup] = useState<string>("")

  // Function to fetch kilometrage alerts - optimized for speed
  const fetchKilometrageAlertes = async () => {
    setIsLoadingKilometrage(true)
    setKilometrageError(null)

    try {
      // Use the optimized API that gets pre-calculated alerts
      const res = await fetch("/api/alerts/kilometrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des alertes kilométrage")
      }

      const alertes = await res.json()
      console.log("Fetched kilometrage alerts:", alertes.length)
      setVehiculesAlertes(alertes)
    } catch (error) {
      console.error("Error fetching kilometrage alerts:", error)
      setKilometrageError("Erreur lors du chargement des alertes kilométrage")
    } finally {
      setIsLoadingKilometrage(false)

      // Start loading document alerts in the background if not already started
      if (!documentLoadingStarted.current) {
        documentLoadingStarted.current = true
        fetchDocumentAlertes()
      }
    }
  }

  // Function to fetch document alerts - runs in the background
  const fetchDocumentAlertes = async () => {
    // No loading indicator for background loading
    setDocumentError(null)

    try {
      // Use the optimized API that gets pre-calculated alerts
      const res = await fetch("/api/alerts/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des alertes documents")
      }

      const alertes = await res.json()
      console.log("Fetched document alerts:", alertes.length)
      setDocumentsAlertes(alertes)
    } catch (error) {
      console.error("Error fetching document alerts:", error)
      setDocumentError("Erreur lors du chargement des alertes documents")
    }
  }

  // Load data when component mounts
  useEffect(() => {
    // Only load kilometrage alerts initially for speed
    // Document alerts will load in the background after kilometrage alerts finish
    fetchKilometrageAlertes()

    // Trigger the midnight check API to ensure it's running
    // This is optional and can be removed if you have a separate cron job
    fetch("/api/scheduler/midnight-check")
      .then((res) => res.json())
      .then((data) => console.log("Midnight check status:", data))
      .catch((err) => console.error("Error triggering midnight check:", err))
  }, [userId])

  // Open the kilometrage update popup
  const handleUpdateKilometrage = (code_vehicule: string) => {
    setSelectedVehicleForPopup(code_vehicule)
    setIsKilometragePopupOpen(true)
  }

  // Handle the kilometrage update
  const handleKilometrageUpdate = async ({
    code_vehicule,
    kilo_parcouru_heure_fonctionnement,
  }: {
    code_vehicule: string
    kilo_parcouru_heure_fonctionnement: number
  }) => {
    try {
      const response = await fetch("/api/vehicule/kilometrage-heure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_vehicule,
          kilo_parcouru_heure_fonctionnement,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du kilométrage")
      }

      // Refresh the alerts list after successful update
      fetchKilometrageAlertes()
      return Promise.resolve()
    } catch (error) {
      console.error("Error updating kilometrage:", error)
      return Promise.reject(error)
    }
  }

  const navigateToVehicules = () => {
    router.push("/vehicule")
  }

  // Get color class based on days remaining
  const getColorClass = (days: number) => {
    if (days <= 3) return "bg-red-100 text-red-800"
    if (days <= 5) return "bg-orange-100 text-orange-800"
    if (days <= 10) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  // Handle refresh button click
  const handleRefresh = () => {
    // Reset document loading flag
    documentLoadingStarted.current = false

    // Fetch kilometrage alerts first (document alerts will load in background after)
    fetchKilometrageAlertes()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord des alertes</h1>
        <div className="flex space-x-2">
          <button
            onClick={navigateToVehicules}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CarIcon className="h-4 w-4 mr-2" />
            Liste des véhicules
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoadingKilometrage}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoadingKilometrage ? (
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <CarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules nécessitant une mise à jour</p>
              <p className="text-2xl font-semibold text-gray-900">{vehiculesAlertes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <FileTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents à renouveler</p>
              <p className="text-2xl font-semibold text-gray-900">{documentsAlertes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kilometrage Alerts Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Véhicules nécessitant une mise à jour de kilométrage / heures
          </h2>
        </div>

        {isLoadingKilometrage ? (
          <div className="px-6 py-12 text-center">
            <LoaderIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium text-gray-500">Chargement des alertes...</p>
          </div>
        ) : kilometrageError ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-500">Erreur lors du chargement des alertes</p>
              <p className="text-sm text-gray-500 mt-1">{kilometrageError}</p>
              <button
                onClick={fetchKilometrageAlertes}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        ) : vehiculesAlertes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">Aucune alerte</p>
            <p className="text-sm text-gray-500 mt-1">
              Tous les véhicules ont été mis à jour dans les 3 derniers jours.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Marque / Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dernière mise à jour
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Jours écoulés
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehiculesAlertes.map((vehicule) => (
                  <tr key={vehicule.code_vehicule} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicule.code_vehicule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicule.n_immatriculation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicule.marque_designation} / {vehicule.type_designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicule.derniere_mise_a_jour === "Jamais" || vehicule.derniere_mise_a_jour === null
                        ? "Jamais"
                        : new Date(vehicule.derniere_mise_a_jour).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicule.jours_depuis_maj > 7
                            ? "bg-red-100 text-red-800"
                            : vehicule.jours_depuis_maj > 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicule.jours_depuis_maj === 999 ? "Jamais" : `${vehicule.jours_depuis_maj} jours`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleUpdateKilometrage(vehicule.code_vehicule)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ClockIcon className="h-3.5 w-3.5 mr-1" color="white" />
                        Mettre à jour
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Alerts Section - No loading indicator for background loading */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Documents de bord à renouveler</h2>
        </div>

        {documentError ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-500">Erreur lors du chargement des documents</p>
              <p className="text-sm text-gray-500 mt-1">{documentError}</p>
              <button
                onClick={fetchDocumentAlertes}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        ) : documentsAlertes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">Aucun document à renouveler</p>
            <p className="text-sm text-gray-500 mt-1">Tous les documents sont à jour pour les 10 prochains jours.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Marque / Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Document
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date d'expiration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Jours restants
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentsAlertes.map((doc, index) => (
                  <tr key={`${doc.code_vehicule}-${doc.document_type}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.code_vehicule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.n_immatriculation || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.marque_designation || "-"} / {doc.type_designation || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <FileTextIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {doc.document_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.date_fin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass(
                          doc.jours_restants,
                        )}`}
                      >
                        {doc.jours_restants <= 0 ? "Expiré" : `${doc.jours_restants} jours`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kilometrage Update Popup */}
      <KilometrageUpdatePopup
        isOpen={isKilometragePopupOpen}
        onClose={() => setIsKilometragePopupOpen(false)}
        code_vehicule={selectedVehicleForPopup}
        onUpdate={handleKilometrageUpdate}
      />
    </div>
  )
}
