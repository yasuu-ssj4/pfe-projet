"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  CarIcon,
  ClockIcon,
  LoaderIcon,
  RefreshCwIcon,
  FileTextIcon,
  AlertCircleIcon,
  PauseCircleIcon,
  WrenchIcon,
  X,
} from "lucide-react"
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

type MaintenanceAlerte = {
  code_vehicule: string
  code_type: number
  code_gamme: string
  code_operation: string
  gamme_designation: string
  operation_designation: string
  periode: number
  valeur_accumulee: number
  valeur_restante: number
  unite_mesure: string
}

export default function DashboardPage({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const router = useRouter()

  // Active tab state
  const [activeTab, setActiveTab] = useState("kilometrage")

  // State for kilometrage alerts
  const [vehiculesAlertes, setVehiculesAlertes] = useState<VehiculeAlerte[]>([])
  const [isLoadingKilometrage, setIsLoadingKilometrage] = useState(true)
  const [kilometrageError, setKilometrageError] = useState<string | null>(null)

  // State for document alerts
  const [documentsAlertes, setDocumentsAlertes] = useState<DocumentAlerte[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [documentError, setDocumentError] = useState<string | null>(null)

  // State for demandes en instance
  const [demandesEnInstanceCount, setDemandesEnInstanceCount] = useState<number>(0)
  const [isLoadingDemandesEnInstance, setIsLoadingDemandesEnInstance] = useState(true)
  const [demandesEnInstanceError, setDemandesEnInstanceError] = useState<string | null>(null)

  // State for vehicules immobilisés
  const [vehiculesImmobilisesCount, setVehiculesImmobilisesCount] = useState<number>(0)
  const [isLoadingVehiculesImmobilises, setIsLoadingVehiculesImmobilises] = useState(true)
  const [vehiculesImmobilisesError, setVehiculesImmobilisesError] = useState<string | null>(null)

  // State for maintenance alerts
  const [maintenanceAlertes, setMaintenanceAlertes] = useState<MaintenanceAlerte[]>([])
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true)
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null)
  const [resettingMaintenance, setResettingMaintenance] = useState<Record<string, boolean>>({})

  // Popup state
  const [isKilometragePopupOpen, setIsKilometragePopupOpen] = useState(false)
  const [selectedVehicleForPopup, setSelectedVehicleForPopup] = useState<string>("")

  // Load ALL data when component mounts
  useEffect(() => {
    console.log("Dashboard mounted - loading ALL data immediately")

    // Load all data in parallel
    fetchKilometrageAlertes()
    fetchDocumentAlertes()
    fetchDemandesEnInstanceCount()
    fetchVehiculesImmobilisesCount()
    fetchMaintenanceAlertes()

    // Trigger the midnight check API to ensure it's running
    fetch("/api/scheduler/midnight-check")
      .then((res) => res.json())
      .then((data) => console.log("Midnight check status:", data))
      .catch((err) => console.error("Error triggering midnight check:", err))
  }, [userId])

  // Function to fetch kilometrage alerts
  const fetchKilometrageAlertes = async () => {
    console.log("Fetching kilometrage alerts")
    setIsLoadingKilometrage(true)
    setKilometrageError(null)

    try {
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
    }
  }

  // Function to fetch document alerts
  const fetchDocumentAlertes = async () => {
    console.log("Fetching document alerts")
    setIsLoadingDocuments(true)
    setDocumentError(null)

    try {
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
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  // Function to fetch count of vehicles with demandes in "En instance" state
  const fetchDemandesEnInstanceCount = async () => {
    console.log("Fetching demandes en instance count")
    setIsLoadingDemandesEnInstance(true)
    setDemandesEnInstanceError(null)

    try {
      const res = await fetch("/api/alerts/demandes-en-instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des demandes en instance")
      }

      const data = await res.json()
      console.log("Fetched demandes en instance count:", data.count)
      setDemandesEnInstanceCount(data.count)
    } catch (error) {
      console.error("Error fetching demandes en instance count:", error)
      setDemandesEnInstanceError("Erreur lors du chargement des demandes en instance")
    } finally {
      setIsLoadingDemandesEnInstance(false)
    }
  }

  // Function to fetch count of vehicles with status "IMB"
  const fetchVehiculesImmobilisesCount = async () => {
    console.log("Fetching vehicules immobilisés count")
    setIsLoadingVehiculesImmobilises(true)
    setVehiculesImmobilisesError(null)

    try {
      const res = await fetch("/api/alerts/vehicules-immobilises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des véhicules immobilisés")
      }

      const data = await res.json()
      console.log("Fetched vehicules immobilisés count:", data.count)
      setVehiculesImmobilisesCount(data.count)
    } catch (error) {
      console.error("Error fetching vehicules immobilisés count:", error)
      setVehiculesImmobilisesError("Erreur lors du chargement des véhicules immobilisés")
    } finally {
      setIsLoadingVehiculesImmobilises(false)
    }
  }

  // Function to fetch maintenance alerts
  const fetchMaintenanceAlertes = async () => {
    console.log("Fetching maintenance alerts")
    setIsLoadingMaintenance(true)
    setMaintenanceError(null)

    try {
      const res = await fetch("/api/alerts/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des alertes de maintenance")
      }

      const alertes = await res.json()
      console.log("Fetched maintenance alerts:", alertes.length)
      setMaintenanceAlertes(alertes)
    } catch (error) {
      console.error("Error fetching maintenance alerts:", error)
      setMaintenanceError("Erreur lors du chargement des alertes de maintenance")
    } finally {
      setIsLoadingMaintenance(false)
    }
  }

  // Handle maintenance reset
  const handleResetMaintenance = async (alert: MaintenanceAlerte) => {
    try {
      const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
      setResettingMaintenance({ ...resettingMaintenance, [key]: true })

      const response = await fetch("/api/alerts/maintenance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_vehicule: alert.code_vehicule,
          code_type: alert.code_type,
          code_gamme: alert.code_gamme,
          code_operation: alert.code_operation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset maintenance counter")
      }

      // Remove this alert from the list
      setMaintenanceAlertes(
        maintenanceAlertes.filter(
          (a) =>
            !(
              a.code_vehicule === alert.code_vehicule &&
              a.code_type === alert.code_type &&
              a.code_gamme === alert.code_gamme &&
              a.code_operation === alert.code_operation
            ),
        ),
      )
    } catch (error) {
      console.error("Error resetting maintenance counter:", error)
  
    } finally {
      const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
      setResettingMaintenance({ ...resettingMaintenance, [key]: false })
    }
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

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

  // Navigate to demandes en instance
  const navigateToDemandesEnInstance = () => {
    router.push("/listeDI")
  }

  // Navigate to vehicules immobilisés
  const navigateToVehiculesImmobilises = () => {
    router.push("/vehicule/immobilisation")
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
    // Refresh all data
    fetchKilometrageAlertes()
    fetchDocumentAlertes()
    fetchDemandesEnInstanceCount()
    fetchVehiculesImmobilisesCount()
    fetchMaintenanceAlertes()
  }

  // Render maintenance alerts table
  const renderMaintenanceAlertsTable = () => {
    if (isLoadingMaintenance) {
      return (
        <div className="px-6 py-12 text-center">
          <LoaderIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg font-medium text-gray-500">Chargement des alertes de maintenance...</p>
        </div>
      )
    }

    if (maintenanceError) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="flex flex-col items-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-500">{maintenanceError}</p>
            <button
              onClick={fetchMaintenanceAlertes}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Réessayer
            </button>
          </div>
        </div>
      )
    }

    if (maintenanceAlertes.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Aucune alerte de maintenance</p>
          <p className="text-sm text-gray-500 mt-1">
            Tous les véhicules sont à jour avec leur programme de maintenance.
          </p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gamme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opération
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur accumulée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur restante
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenanceAlertes.map((alert, index) => {
              const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
              const isResetting = resettingMaintenance[key] || false

              return (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.code_vehicule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.gamme_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.operation_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.valeur_accumulee.toLocaleString()} {alert.unite_mesure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.periode.toLocaleString()} {alert.unite_mesure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.valeur_restante <= 0
                          ? "bg-red-100 text-red-800"
                          : alert.valeur_restante <= alert.periode * 0.1
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.valeur_restante <= 0
                        ? "Dépassé"
                        : `${alert.valeur_restante.toLocaleString()} ${alert.unite_mesure}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleResetMaintenance(alert)}
                      disabled={isResetting}
                      className="text-red-600 hover:text-red-900 focus:outline-none disabled:opacity-50"
                      title="Réinitialiser le compteur"
                    >
                      {isResetting ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord des alertes</h1>
        <div className="flex items-center space-x-4">
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
              disabled={
                isLoadingKilometrage ||
                isLoadingDocuments ||
                isLoadingMaintenance ||
                isLoadingDemandesEnInstance ||
                isLoadingVehiculesImmobilises
              }
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoadingKilometrage ||
              isLoadingDocuments ||
              isLoadingMaintenance ||
              isLoadingDemandesEnInstance ||
              isLoadingVehiculesImmobilises ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Kilometrage Alerts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <CarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules nécessitant une mise à jour Km/h parcourus</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingKilometrage ? "..." : vehiculesAlertes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Document Alerts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <FileTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents de bords à renouveler</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingDocuments ? "..." : documentsAlertes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Alerts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <WrenchIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenances preventives proches</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingMaintenance ? "..." : maintenanceAlertes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Demandes En Instance Card */}
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50"
          onClick={navigateToDemandesEnInstance}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <AlertCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">DI en instance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingDemandesEnInstance ? "..." : demandesEnInstanceCount}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicules Immobilisés Card */}
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 cursor-pointer hover:bg-gray-50"
          onClick={navigateToVehiculesImmobilises}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <PauseCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules immobilisés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingVehiculesImmobilises ? "..." : vehiculesImmobilisesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("kilometrage")}
              className={`${
                activeTab === "kilometrage"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Alertes Kilométrage/Heure
            </button>
            <button
              onClick={() => handleTabChange("documents")}
              className={`${
                activeTab === "documents"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Alertes Documents de bords
            </button>
            <button
              onClick={() => handleTabChange("maintenance")}
              className={`${
                activeTab === "maintenance"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Alertes Maintenance Preventive
            </button>
          </nav>
        </div>
      </div>

      {/* Kilometrage Alerts Tab */}
      {activeTab === "kilometrage" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicule.n_immatriculation}
                      </td>
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
                          onClick={
                            userPrivs.includes("modifier_kilo_heure")
                              ? () => handleUpdateKilometrage(vehicule.code_vehicule)
                              : undefined
                          }
                          disabled={!userPrivs.includes("modifier_kilo_heure")}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white 
                            ${
                              userPrivs.includes("modifier_kilo_heure")
                                ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                : "bg-gray-400 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            }`}
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
      )}

      {/* Document Alerts Tab */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Documents de bord à renouveler</h2>
          </div>

          {isLoadingDocuments ? (
            <div className="px-6 py-12 text-center">
              <LoaderIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium text-gray-500">Chargement des documents...</p>
            </div>
          ) : documentError ? (
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
      )}

      {/* Maintenance Alerts Tab */}
      {activeTab === "maintenance" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Alertes de maintenance basées sur le kilométrage</h2>
          </div>
          {renderMaintenanceAlertsTable()}
        </div>
      )}

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
