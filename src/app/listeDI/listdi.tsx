"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  FilterIcon,
  LoaderIcon,
  MoreVertical,
  RefreshCwIcon,
  XIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"

type DemandeIntervention = {
  id_demande_intervention: number
  etat_demande: string
  nature_panne: string
  nature_travaux: string
  date_application: Date
  degre_urgence: string
  code_vehicule: string
  numero_demande: string
}

type SortConfig = {
  key: keyof DemandeIntervention | null
  direction: "asc" | "desc"
}

type ColumnFilters = {
  id_demande_intervention: string
  numero_demande: string
  etat_demande: string
  nature_panne: string
  nature_travaux: string
  date_application: string
  degre_urgence: string
  code_vehicule: string
}

export default function ListDIPage() {
  const router = useRouter()
  const [demandes, setDemandes] = useState<DemandeIntervention[]>([])
  const [filteredDemandes, setFilteredDemandes] = useState<DemandeIntervention[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [urgenceFilter, setUrgenceFilter] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    id_demande_intervention: "",
    numero_demande: "",
    etat_demande: "",
    nature_panne: "",
    nature_travaux: "",
    date_application: "",
    degre_urgence: "",
    code_vehicule: "",
  })

  const [isDeletingDemande, setIsDeletingDemande] = useState<number | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<number | null>(null)

  const itemsPerPage = 10
  const userId = 2 

  const fetchDemandes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/intervention/listeDi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des demandes d'intervention")
      }

      const data: DemandeIntervention[] = await res.json()
      setDemandes(data)
      setFilteredDemandes(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDemandes()
  }, [])

  useEffect(() => {
    // Apply filters and sorting
    let results = [...demandes]

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        const filterKey = key as keyof DemandeIntervention
        results = results.filter((demande) => {
          const fieldValue = demande[filterKey]
          if (fieldValue === null || fieldValue === undefined) return false

          if (filterKey === "date_application") {
            const dateStr = new Date(fieldValue as Date).toLocaleDateString("fr-FR")
            return dateStr.toLowerCase().includes(value.toLowerCase())
          }

          return fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        })
      }
    })

    // Apply dropdown filters
    if (statusFilter) {
      results = results.filter((demande) => demande.etat_demande === statusFilter)
    }

    if (urgenceFilter) {
      results = results.filter((demande) => demande.degre_urgence === urgenceFilter)
    }

    // Apply sorting
    if (sortConfig.key) {
      results.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        let comparison = 0

        if (sortConfig.key === "date_application") {
          const dateA = new Date(aValue as Date)
          const dateB = new Date(bValue as Date)
          comparison = dateA.getTime() - dateB.getTime()
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else {
          comparison = aValue.toString().localeCompare(bValue.toString())
        }

        return sortConfig.direction === "desc" ? -comparison : comparison
      })
    }

    setFilteredDemandes(results)
    setCurrentPage(1)
  }, [columnFilters, statusFilter, urgenceFilter, sortConfig, demandes])

  const handleSort = (key: keyof DemandeIntervention) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleColumnFilterChange = (column: keyof ColumnFilters, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const clearAllFilters = () => {
    setColumnFilters({
      id_demande_intervention: "",
      numero_demande: "",
      etat_demande: "",
      nature_panne: "",
      nature_travaux: "",
      date_application: "",
      degre_urgence: "",
      code_vehicule: "",
    })
    setStatusFilter("")
    setUrgenceFilter("")
    setSortConfig({ key: null, direction: "asc" })
  }

  const supprimerDemande = async (id_demande_intervention: number) => {
    try {
      setIsDeletingDemande(id_demande_intervention)
      const response = await fetch("/api/intervention/ajouterDemande", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_demande_intervention }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la demande")
      }

      alert("Demande supprimée avec succès")
      fetchDemandes()
      return Promise.resolve()
    } catch (error) {
      console.error("Erreur de suppression:", error)
      alert("Erreur lors de la suppression de la demande")
      return Promise.reject(error)
    } finally {
      setIsDeletingDemande(null)
      setShowDeleteConfirmation(null)
    }
  }

  const confirmDelete = (id_demande_intervention: number) => {
    setShowDeleteConfirmation(id_demande_intervention)
  }

  const navigateToConstater = (id_demande_intervention: number) => {
    router.push(`/vehicule/intervention/demande/${id_demande_intervention}`)
  }

  // Get unique values for dropdown filters
  const uniqueStatuses = Array.from(new Set(demandes.map((demande) => demande.etat_demande))).filter(Boolean)
  const uniqueUrgences = Array.from(new Set(demandes.map((demande) => demande.degre_urgence))).filter(Boolean)

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredDemandes.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }

      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }

      if (startPage > 2) {
        pageNumbers.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const hasActiveFilters = Object.values(columnFilters).some((filter) => filter !== "") || statusFilter || urgenceFilter

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en cours":
        return "bg-blue-100 text-blue-800"
      case "terminé":
        return "bg-green-100 text-green-800"
      case "annulé":
        return "bg-red-100 text-red-800"
      case "qualification":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgenceColor = (urgence: string) => {
    switch (urgence.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "normal":
        return "bg-green-100 text-green-800"
      case "faible":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Liste des Demandes d'Intervention</h2>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les statuts</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Urgence Filter */}
            <div className="relative">
              <select
                value={urgenceFilter}
                onChange={(e) => setUrgenceFilter(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Toutes les urgences</option>
                {uniqueUrgences.map((urgence) => (
                  <option key={urgence} value={urgence}>
                    {urgence}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Effacer
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchDemandes}
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
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500">
            <FilterIcon className="h-4 w-4 mr-2" />
            <span className="mr-2">Filtres actifs:</span>
            {Object.entries(columnFilters).map(([key, value]) =>
              value ? (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-1"
                >
                  {key}: {value}
                </span>
              ) : null,
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-1">
                Statut: {statusFilter}
              </span>
            )}
            {urgenceFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-1">
                Urgence: {urgenceFilter}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("numero_demande")}
              >
                <div className="flex items-center">
                  <span>N.Demande</span>
                  {sortConfig.key === "numero_demande" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("code_vehicule")}
              >
                <div className="flex items-center">
                  <span>Véhicule</span>
                  {sortConfig.key === "code_vehicule" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("etat_demande")}
              >
                <div className="flex items-center">
                  <span>État</span>
                  {sortConfig.key === "etat_demande" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("nature_panne")}
              >
                <div className="flex items-center">
                  <span>Panne</span>
                  {sortConfig.key === "nature_panne" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("nature_travaux")}
              >
                <div className="flex items-center">
                  <span>Travaux</span>
                  {sortConfig.key === "nature_travaux" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("date_application")}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortConfig.key === "date_application" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("degre_urgence")}
              >
                <div className="flex items-center">
                  <span>Urgence</span>
                  {sortConfig.key === "degre_urgence" && (
                    <div className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            </tr>
            {/* Search row */}
            <tr className="bg-gray-25">
              <td className="px-6 py-2"></td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.numero_demande}
                  onChange={(e) => handleColumnFilterChange("numero_demande", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.code_vehicule}
                  onChange={(e) => handleColumnFilterChange("code_vehicule", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.etat_demande}
                  onChange={(e) => handleColumnFilterChange("etat_demande", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.nature_panne}
                  onChange={(e) => handleColumnFilterChange("nature_panne", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.nature_travaux}
                  onChange={(e) => handleColumnFilterChange("nature_travaux", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.date_application}
                  onChange={(e) => handleColumnFilterChange("date_application", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-2">
                <input
                  type="text"
                  placeholder=""
                  value={columnFilters.degre_urgence}
                  onChange={(e) => handleColumnFilterChange("degre_urgence", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <LoaderIcon className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Chargement des demandes...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg font-medium text-red-500">Erreur lors du chargement des demandes</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                    <button
                      onClick={fetchDemandes}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Réessayer
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredDemandes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Aucune demande trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {hasActiveFilters
                        ? "Essayez de modifier vos filtres"
                        : "Aucune demande d'intervention disponible"}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((demande) => (
                <tr key={demande.id_demande_intervention} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" color="black" />
                            <span className="sr-only">Options</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[200px] bg-white border border-gray-200 shadow-lg rounded-md py-1"
                        >
                          <DropdownMenuItem
                            onClick={() => navigateToConstater(demande.id_demande_intervention)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                          >
                            <span className="mr-2"></span> Constater
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(demande.id_demande_intervention)}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
                          >
                            <span className="mr-2"></span> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {demande.numero_demande}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.code_vehicule}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        demande.etat_demande,
                      )}`}
                    >
                      {demande.etat_demande}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.nature_panne}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.nature_travaux}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(demande.date_application).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgenceColor(
                        demande.degre_urgence,
                      )}`}
                    >
                      {demande.degre_urgence}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && !error && filteredDemandes.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1}-{Math.min(endIndex, filteredDemandes.length)} sur {filteredDemandes.length}{" "}
              demandes
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cette demande d'intervention ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                disabled={isDeletingDemande === showDeleteConfirmation}
              >
                Annuler
              </button>
              <button
                onClick={() => supprimerDemande(showDeleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 flex items-center"
                disabled={isDeletingDemande === showDeleteConfirmation}
              >
                {isDeletingDemande === showDeleteConfirmation ? (
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
    </div>
  )
}
