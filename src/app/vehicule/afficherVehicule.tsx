"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Demande from "./intervention/demande/demande"
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  LoaderIcon,
  MoreVertical,
  RefreshCwIcon,
  XIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"

import KilometrageUpdatePopup from "./popups/kilometrage-update-popup"
import AffectationUpdatePopup from "./popups/affectation-update-popup"
import StatusUpdatePopup from "./popups/status-update-popup"
import VehiculeDetailsPopup from "./popups/vehicule-details-popup"
import ModificationPopup from "./popups/modification-popup"
import StatusHistoryPopup from "./popups/status-history-popup"

type Vehiculetype = {
  code_vehicule: string
  n_immatriculation: string
  code_structure: string
  type_designation: string
  marque_designation: string
  status_designation: string | null
  total_kilometrage: number
  derniere_mise_a_jour?: string
  besoin_mise_a_jour?: boolean
}

type SortConfig = {
  key: keyof Vehiculetype | null
  direction: "asc" | "desc"
}

export default function AfficheVehicule({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const router = useRouter()
  const [vehicules, setVehicules] = useState<Vehiculetype[]>([])
  const [filteredVehicules, setFilteredVehicules] = useState<Vehiculetype[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [structureFilter, setStructureFilter] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehiculeCode, setSelectedVehiculeCode] = useState<string>("")
  const [vehiculesNeedingUpdate, setVehiculesNeedingUpdate] = useState<string[]>([])

  // Column search filters
  const [columnFilters, setColumnFilters] = useState<{ [key in keyof Vehiculetype]?: string }>({})

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })

  // Popup states
  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false)
  const [isKilometragePopupOpen, setIsKilometragePopupOpen] = useState(false)
  const [isAffectationPopupOpen, setIsAffectationPopupOpen] = useState(false)
  const [selectedVehicleForPopup, setSelectedVehicleForPopup] = useState<string>("")
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false)
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<string>("")
  const [isModificationPopupOpen, setIsModificationPopupOpen] = useState(false)
  const [selectedVehicleForModification, setSelectedVehicleForModification] = useState<string>("")
  const [isStatusHistoryPopupOpen, setIsStatusHistoryPopupOpen] = useState(false)
  const [selectedVehicleForStatusHistory, setSelectedVehicleForStatusHistory] = useState<string>("")

  const [isDeletingVehicle, setIsDeletingVehicle] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null)

  const handleAjouterDemande = (code_vehicule: string) => {
    setSelectedVehiculeCode(code_vehicule)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Popup handlers
  const openStatusPopup = (code_vehicule: string) => {
    setSelectedVehicleForPopup(code_vehicule)
    setIsStatusPopupOpen(true)
  }

  const openKilometragePopup = (code_vehicule: string) => {
    setSelectedVehicleForPopup(code_vehicule)
    setIsKilometragePopupOpen(true)
  }

  const openAffectationPopup = (code_vehicule: string) => {
    setSelectedVehicleForPopup(code_vehicule)
    setIsAffectationPopupOpen(true)
  }

  const openDetailsPopup = (code_vehicule: string) => {
    setSelectedVehicleForDetails(code_vehicule)
    setIsDetailsPopupOpen(true)
  }

  const openModificationPopup = (code_vehicule: string) => {
    setSelectedVehicleForModification(code_vehicule)
    setIsModificationPopupOpen(true)
  }

  const openStatusHistoryPopup = (code_vehicule: string) => {
    setSelectedVehicleForStatusHistory(code_vehicule)
    setIsStatusHistoryPopupOpen(true)
  }

  const supprimerVehicule = async (code_vehicule: string) => {
    try {
      setIsDeletingVehicle(code_vehicule)
      const response = await fetch("/api/vehicule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du véhicule")
      }

      // Show success message
      alert("Véhicule supprimé avec succès")

      // Refresh the vehicle list
      fetchVehicules()
      return Promise.resolve()
    } catch (error) {
      console.error("Erreur de suppression:", error)
      alert("Erreur lors de la suppression du véhicule")
      return Promise.reject(error)
    } finally {
      setIsDeletingVehicle(null)
      setShowDeleteConfirmation(null)
    }
  }

  const confirmDelete = (code_vehicule: string) => {
    setShowDeleteConfirmation(code_vehicule)
  }

  const handleStatusUpdate = async ({ code_vehicule, code_status }: { code_vehicule: string; code_status: string }) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/vehicule/status/affecterStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule, code_status }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut")
      }

      alert("Statut mis à jour avec succès")
      fetchVehicules()
      return Promise.resolve()
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Erreur lors de la mise à jour du statut")
      return Promise.reject(error)
    }
  }

  const handleKilometrageUpdate = async ({
    code_vehicule,
    kilo_parcouru_heure_fonctionnement,
  }: {
    code_vehicule: string
    kilo_parcouru_heure_fonctionnement: number
  }) => {
    try {
      // Replace with your actual API endpoint
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

      alert("Kilométrage mis à jour avec succès")
      fetchVehicules()
      return Promise.resolve()
    } catch (error) {
      console.error("Error updating kilometrage:", error)
      alert("Erreur lors de la mise à jour du kilométrage")
      return Promise.reject(error)
    }
  }

  const handleAffectationUpdate = async (code_vehicule: string, code_structure: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/vehicule/affectation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule, code_structure }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'affectation")
      }

      alert("Affectation mise à jour avec succès")
      // Refresh the vehicle list after successful update
      fetchVehicules()
      return Promise.resolve()
    } catch (error) {
      console.error("Error updating affectation:", error)
      alert("Erreur lors de la mise à jour de l'affectation")
      return Promise.reject(error)
    }
  }
  type dateMaj = {
    code_vehicule: string
    date: Date
  }
  // Check if a vehicle needs a kilometrage update
  const checkKilometrageUpdateNeeded = async (vehicules: Vehiculetype[]) => {
    try {
      const updatedVehicules = [...vehicules]
      const needsUpdate: string[] = []

      // Process each vehicle
      for (const vehicule of updatedVehicules) {
        const response = await fetch("/api/vehicule/kilometrage-heure/GetDerniereDate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code_vehicule: vehicule.code_vehicule }),
        })

        if (response.ok) {
          const responseData: dateMaj[] = await response.json()
          const data = responseData[0]
          console.log("Response data:", data)

          if (data && data.date !== null) {
            vehicule.derniere_mise_a_jour = new Date(data.date).toISOString().split("T")[0]
            console.log("Dernière mise à jour:", vehicule.derniere_mise_a_jour)

            const lastUpdateDate = new Date(data.date)
            const currentDate = new Date()
            const diffTime = Math.abs(currentDate.getTime() - lastUpdateDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 3) {
              vehicule.besoin_mise_a_jour = true
              needsUpdate.push(vehicule.code_vehicule)
            } else {
              vehicule.besoin_mise_a_jour = false
            }
          }
        }
      }

      setVehicules(updatedVehicules)
      setVehiculesNeedingUpdate(needsUpdate)
    } catch (error) {
      console.error("Error checking kilometrage updates:", error)
    }
  }

  const itemsPerPage = 10

  const fetchVehicules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/vehicule/getVehicules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des véhicules")
      }

      const data: Vehiculetype[] = await res.json()
      setVehicules(data)
      setFilteredVehicules(data)

      // Check for vehicles needing kilometrage updates
      checkKilometrageUpdateNeeded(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicules()

    // Set up daily check at midnight
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0,
      0,
      0, // at 00:00:00
    )
    const timeToMidnight = night.getTime() - now.getTime()

    // Set timeout for first check at midnight
    const midnightTimeout = setTimeout(() => {
      checkKilometrageUpdateNeeded(vehicules)

      // Then set interval for daily checks
      const dailyInterval = setInterval(
        () => {
          checkKilometrageUpdateNeeded(vehicules)
        },
        24 * 60 * 60 * 1000,
      ) // 24 hours

      return () => clearInterval(dailyInterval)
    }, timeToMidnight)

    return () => clearTimeout(midnightTimeout)
  }, [userId])

  // Handle sorting
  const requestSort = (key: keyof Vehiculetype) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Vehiculetype) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    )
  }

  // Apply filters and sorting
  useEffect(() => {
    // Start with all vehicles
    let results = [...vehicules]

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        const filterKey = key as keyof Vehiculetype
        results = results.filter((vehicule) => {
          const vehicleValue = vehicule[filterKey]
          if (vehicleValue === null || vehicleValue === undefined) return false

          // Handle different types of values
          if (typeof vehicleValue === "number") {
            return vehicleValue.toString().includes(value.toLowerCase())
          } else if (typeof vehicleValue === "string") {
            return vehicleValue.toLowerCase().includes(value.toLowerCase())
          } else if (typeof vehicleValue === "string" && !isNaN(Date.parse(vehicleValue))) {
            // If the string can be parsed as a date, filter by date string
            return new Date(vehicleValue).toLocaleDateString().includes(value)
          }
          return false
        })
      }
    })

    // Apply status filter
    if (statusFilter) {
      results = results.filter((vehicule) => vehicule.status_designation === statusFilter)
    }

    // Apply structure filter
    if (structureFilter) {
      results = results.filter((vehicule) => vehicule.code_structure === structureFilter)
    }

    // Apply sorting
    if (sortConfig.key) {
      results.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Vehiculetype]
        const bValue = b[sortConfig.key as keyof Vehiculetype]

        if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1
        if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1

        // Handle different types of values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        } else if (
          typeof aValue === "string" &&
          !isNaN(Date.parse(aValue)) &&
          typeof bValue === "string" &&
          !isNaN(Date.parse(bValue))
        ) {
          const aDate = new Date(aValue)
          const bDate = new Date(bValue)
          return sortConfig.direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
        }

        return 0
      })
    }

    setFilteredVehicules(results)
    setCurrentPage(1) // Reset to first page when filters change
  }, [columnFilters, statusFilter, structureFilter, vehicules, sortConfig])

  // Handle column filter change
  const handleColumnFilterChange = (key: keyof Vehiculetype, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(vehicules.map((vehicule) => vehicule.status_designation))).filter(
    Boolean,
  ) as string[]

  // Get unique structures for filter dropdown
  const uniqueStructures = Array.from(new Set(vehicules.map((vehicule) => vehicule.code_structure))).filter(
    Boolean,
  ) as string[]

  const totalPages = Math.ceil(filteredVehicules.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredVehicules.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Clear all filters
  const clearFilters = () => {
    setColumnFilters({})
    setStatusFilter("")
    setStructureFilter("")
  }

  // Navigate to intervention page with vehicle code
  const navigateToIntervention = (code_vehicule: string) => {
    router.push(`/vehicule/intervention?code_vehicule=${code_vehicule}`)
  }

  // Navigate to add demande page with vehicle code
  const navigateToAddDemande = (code_vehicule: string) => {
    router.push(`/vehicule/intervention/demande?code_vehicule=${code_vehicule}`)
  }

  // Navigate to dashboard
  const navigateToDashboard = () => {
    router.push("/dashboard")
  }

  // Generate page numbers to display
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            {vehiculesNeedingUpdate.length > 0 && (
              <button
                onClick={navigateToDashboard}
                className="ml-3 inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                title="Cliquez pour voir le tableau de bord des alertes"
              >
                <AlertTriangleIcon className="h-4 w-4 mr-1" />
                <span>{vehiculesNeedingUpdate.length} véhicule(s) à mettre à jour</span>
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* clear les filtres */}
            {(Object.values(columnFilters).some((filter) => filter && filter.trim() !== "") ||
              statusFilter ||
              structureFilter) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Effacer les filtres
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchVehicules}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 mr-1" />
              )}
              Actualiser
            </button>
          </div>
        </div>

        {/* Filter Status */}
        {(Object.values(columnFilters).some((filter) => filter && filter.trim() !== "") ||
          statusFilter ||
          structureFilter) && (
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <FilterIcon className="h-4 w-4 mr-2" />
            <span className="mr-2">Filtres actifs:</span>
            {Object.entries(columnFilters).map(([key, value]) =>
              value && value.trim() !== "" ? (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
                >
                  {key}: {value}
                </span>
              ) : null,
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                Statut: {statusFilter}
              </span>
            )}
            {structureFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Structure: {structureFilter}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              ></th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("code_vehicule")}
              >
                <div className="flex items-center">
                  Code
                  {getSortDirectionIndicator("code_vehicule")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.code_vehicule || ""}
                    onChange={(e) => handleColumnFilterChange("code_vehicule", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("n_immatriculation")}
              >
                <div className="flex items-center">
                  Matricule
                  {getSortDirectionIndicator("n_immatriculation")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.n_immatriculation || ""}
                    onChange={(e) => handleColumnFilterChange("n_immatriculation", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("marque_designation")}
              >
                <div className="flex items-center">
                  Marque
                  {getSortDirectionIndicator("marque_designation")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.marque_designation || ""}
                    onChange={(e) => handleColumnFilterChange("marque_designation", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("type_designation")}
              >
                <div className="flex items-center">
                  Type
                  {getSortDirectionIndicator("type_designation")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.type_designation || ""}
                    onChange={(e) => handleColumnFilterChange("type_designation", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("status_designation")}
              >
                <div className="flex items-center">
                  Statut
                  {getSortDirectionIndicator("status_designation")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.status_designation || ""}
                    onChange={(e) => handleColumnFilterChange("status_designation", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("code_structure")}
              >
                <div className="flex items-center">
                  Structure
                  {getSortDirectionIndicator("code_structure")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.code_structure || ""}
                    onChange={(e) => handleColumnFilterChange("code_structure", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("total_kilometrage")}
              >
                <div className="flex items-center">
                  Km total
                  {getSortDirectionIndicator("total_kilometrage")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.total_kilometrage || ""}
                    onChange={(e) => handleColumnFilterChange("total_kilometrage", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("derniere_mise_a_jour")}
              >
                <div className="flex items-center">
                  Dernière MAJ
                  {getSortDirectionIndicator("derniere_mise_a_jour")}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={columnFilters.derniere_mise_a_jour || ""}
                    onChange={(e) => handleColumnFilterChange("derniere_mise_a_jour", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <LoaderIcon className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Chargement des véhicules...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg font-medium text-red-500">Erreur lors du chargement des véhicules</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                    <button
                      onClick={fetchVehicules}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Réessayer
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredVehicules.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Aucun véhicule trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {Object.values(columnFilters).some((filter) => filter && filter.trim() !== "") ||
                      statusFilter ||
                      structureFilter
                        ? "Essayez de modifier vos filtres"
                        : "Ajoutez des véhicules pour les voir apparaître ici"}
                    </p>
                    {(Object.values(columnFilters).some((filter) => filter && filter.trim() !== "") ||
                      statusFilter ||
                      structureFilter) && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((vehicule) => (
                <tr key={vehicule.code_vehicule} className={`hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="relative flex items-center">
                      {vehicule.besoin_mise_a_jour && (
                        <div className="mr-2 absolute -top-1 -left-1" title="Mise à jour du kilométrage/heures requise">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 b" color="black" />
                            <span className="sr-only">Options</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[200px] bg-white border border-gray-200 shadow-lg rounded-md py-1"
                        >
                          <DropdownMenuItem
                            onClick={() => openDetailsPopup(vehicule.code_vehicule)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                          >
                            <span className="mr-2"></span> Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openStatusHistoryPopup(vehicule.code_vehicule)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                          >
                            <span className="mr-2"></span> Historique des statuts
                          </DropdownMenuItem>
                          {userPrivs.includes("modifier_vehicule") && (
                            <DropdownMenuItem
                              onClick={() => openModificationPopup(vehicule.code_vehicule)}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                              <span className="mr-2"></span> Modifier
                            </DropdownMenuItem>
                          )}
                          {userPrivs.includes("ajouter_DI") && (
                            <DropdownMenuItem
                              onClick={() => handleAjouterDemande(vehicule.code_vehicule)}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                              <span className="mr-2"></span> Ajouter Demande
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => navigateToIntervention(vehicule.code_vehicule)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                          >
                            <span className="mr-2"></span> Constater Demande
                          </DropdownMenuItem>
                          {userPrivs.includes("supprimer_vehicule") && (
                            <DropdownMenuItem
                              onClick={() => confirmDelete(vehicule.code_vehicule)}
                              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
                            >
                              <span className="mr-2"></span> Supprimer véhicule
                            </DropdownMenuItem>
                          )}
                          {/* Separator */}
                          <div className="h-px bg-gray-200 my-1"></div>

                          {/* New options for popups */}
                          {userPrivs.includes("modifier_status") && (
                            <DropdownMenuItem
                              onClick={() => openStatusPopup(vehicule.code_vehicule)}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                              <span className="mr-2"></span> Changer le statut
                            </DropdownMenuItem>
                          )}
                          {userPrivs.includes("modifier_kilo_heure") && (
                            <DropdownMenuItem
                              onClick={() => openKilometragePopup(vehicule.code_vehicule)}
                              className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center ${
                                vehicule.besoin_mise_a_jour ? "text-red-600 font-medium" : "text-gray-700"
                              }`}
                            >
                              <span className="mr-2"></span> MAJ kilométrage/heure
                              {vehicule.besoin_mise_a_jour && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Urgent
                                </span>
                              )}
                            </DropdownMenuItem>
                          )}
                          {userPrivs.includes("modifier_affectation") && (
                            <DropdownMenuItem
                              onClick={() => openAffectationPopup(vehicule.code_vehicule)}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                              <span className="mr-2"></span> Changer l'affectation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicule.code_vehicule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicule.n_immatriculation || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicule.marque_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicule.type_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {vehicule.status_designation ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {vehicule.status_designation}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Non défini
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicule.code_structure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicule.total_kilometrage.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicule.derniere_mise_a_jour ? (
                      <span className={vehicule.besoin_mise_a_jour ? "text-red-600" : ""}>
                        {new Date(vehicule.derniere_mise_a_jour).toLocaleDateString()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && !error && filteredVehicules.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1}-{Math.min(endIndex, filteredVehicules.length)} sur{" "}
              {filteredVehicules.length} véhicules
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
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
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Demande */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl">
            <Demande visible={isModalOpen} handleCloseModal={handleCloseModal} code_vehicule={selectedVehiculeCode} />
          </div>
        </div>
      )}

      {/* Popups */}
      <StatusUpdatePopup
        isOpen={isStatusPopupOpen}
        onClose={() => setIsStatusPopupOpen(false)}
        code_vehicule={selectedVehicleForPopup}
        onUpdate={handleStatusUpdate}
      />

      <KilometrageUpdatePopup
        isOpen={isKilometragePopupOpen}
        onClose={() => setIsKilometragePopupOpen(false)}
        code_vehicule={selectedVehicleForPopup}
        onUpdate={handleKilometrageUpdate}
      />

      <AffectationUpdatePopup
        isOpen={isAffectationPopupOpen}
        onClose={() => setIsAffectationPopupOpen(false)}
        code_vehicule={selectedVehicleForPopup}
        onUpdate={({ code_vehicule, code_structure }) => handleAffectationUpdate(code_vehicule, code_structure)}
      />
      <VehiculeDetailsPopup
        isOpen={isDetailsPopupOpen}
        onClose={() => setIsDetailsPopupOpen(false)}
        code_vehicule={selectedVehicleForDetails}
      />
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                disabled={isDeletingVehicle === showDeleteConfirmation}
              >
                Annuler
              </button>
              <button
                onClick={() => supprimerVehicule(showDeleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 flex items-center"
                disabled={isDeletingVehicle === showDeleteConfirmation}
              >
                {isDeletingVehicle === showDeleteConfirmation ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modification Popup */}
      <ModificationPopup
        isOpen={isModificationPopupOpen}
        onClose={() => setIsModificationPopupOpen(false)}
        code_vehicule={selectedVehicleForModification}
        onUpdate={() => fetchVehicules()}
      />
      <StatusHistoryPopup
        isOpen={isStatusHistoryPopupOpen}
        onClose={() => setIsStatusHistoryPopupOpen(false)}
        code_vehicule={selectedVehicleForStatusHistory}
      />
    </div>
  )
}
