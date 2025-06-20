"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  LoaderIcon,
  MoreVertical,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { createPortal } from "react-dom"

type DemandeIntervention = {
  id_demande_intervention: string
  etat_demande: string
  date_application: string
  date_heure_panne: string
  structure_maintenance: string
  activite: string
  nature_panne: string
  nature_travaux: string
  degre_urgence: string
  code_vehicule: string
  district_id: string
  centre_id: string
  constat_panne: string | null
  diagnostique: string | null
  description: string | null
}


type ToastProps = {
  title: string
  description: string
  variant: "default" | "destructive"
  onClose: () => void
}

function Toast({ title, description, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-full max-w-md items-center rounded-lg shadow-lg p-4 transition-all ${
        variant === "destructive" ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"
      }`}
    >
      <div className="mr-3">
        {variant === "destructive" ? (
          <XCircleIcon className="h-6 w-6 text-red-500" />
        ) : (
          <CheckCircle2Icon className="h-6 w-6 text-green-500" />
        )}
      </div>
      <div className="flex-1">
        <h3 className={`text-sm font-medium ${variant === "destructive" ? "text-red-800" : "text-gray-900"}`}>
          {title}
        </h3>
        <p className={`mt-1 text-sm ${variant === "destructive" ? "text-red-700" : "text-gray-500"}`}>{description}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

// Custom Confirmation Dialog Component
type ConfirmationDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
}

function ConfirmationDialog({ open, onClose, onConfirm, title, description }: ConfirmationDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function InterventionList({
  code_vehicule,
  userId,
  userPrivs,
}: {
  code_vehicule: string
  userId: number
  userPrivs: string[]
}) {
  const router = useRouter()
  const [demandes, setDemandes] = useState<DemandeIntervention[]>([])
  const [filteredDemandes, setFilteredDemandes] = useState<DemandeIntervention[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const itemsPerPage = 10

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean
    title: string
    description: string
    variant: "default" | "destructive"
  }>({
    visible: false,
    title: "",
    description: "",
    variant: "default",
  })

  // Confirmation dialog state
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"rapport" | "demande" | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchDemandes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/intervention/getDemandesByVehicule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
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
  }, [code_vehicule])

  useEffect(() => {
    // Apply filters
    let results = [...demandes]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (demande) =>
          demande.id_demande_intervention.toLowerCase().includes(term) ||
          demande.nature_panne.toLowerCase().includes(term) ||
          demande.nature_travaux.toLowerCase().includes(term),
      )
    }

    if (statusFilter) {
      results = results.filter((demande) => demande.etat_demande === statusFilter)
    }

    setFilteredDemandes(results)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, statusFilter, demandes])

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(demandes.map((demande) => demande.etat_demande))).filter(
    Boolean,
  ) as string[]

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredDemandes.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
  }

  // Navigate back to vehicule page
  const navigateBack = () => {
    router.push("/vehicule")
  }

  // Show toast notification
  const showToast = (title: string, description: string, variant: "default" | "destructive") => {
    setToast({
      visible: true,
      title,
      description,
      variant,
    })
  }

  // Close toast
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }))
  }

  const handleDeleteConfirmation = (type: "rapport" | "demande", id: string) => {
    setDeleteType(type)
    setDeleteId(id)
    setConfirmationOpen(true)
  }

  const handleConfirmedDelete = async () => {
    if (!deleteType || !deleteId) return

    try {
      if (deleteType === "rapport") {
        const res = await fetch("/api/rapport/ajouterRapport", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_demande_intervention: deleteId }),
        })

        if (!res.ok) {
          throw new Error("Erreur lors de la suppression du rapport")
        }

        showToast("Succès", "Le rapport a été supprimé avec succès", "default")
      } else {
        const res = await fetch("/api/intervention/ajouterDemande", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_demande_intervention: deleteId }),
        })

        if (!res.ok) {
          throw new Error("Erreur lors de la suppression de la demande")
        }

        showToast("Succès", "La demande a été supprimée avec succès", "default")
      }

      // Refresh the demandes after deletion
      fetchDemandes()
    } catch (error) {
      console.error(`Error in supprimer ${deleteType}:`, error)
      showToast("Erreur", error instanceof Error ? error.message : "Une erreur est survenue", "destructive")
    } finally {
      setConfirmationOpen(false)
      setDeleteType(null)
      setDeleteId(null)
    }
  }

  // Navigate to rapport page with demande id
  const navigateToRapport = (id_demande_intervention: string) => {
    router.push(`/vehicule/intervention/rapport?id_demande=${id_demande_intervention}`)
  }

  // Navigate to completer form with demande id
  const navigateToCompleterForm = (id_demande_intervention: string) => {
    router.push(`/vehicule/intervention/completer/${id_demande_intervention}`)
  }
  // Navigate to constater demande page with vehicle code
  const navigateToConstaterDemande = (id_demande_intervention: string) => {
    // First we need to get the demande ID for this vehicle
    // For now, we'll navigate to a placeholder route
    router.push(`/vehicule/intervention/demande/${id_demande_intervention}`)
  }
  //Navigate to constater rapport
  const navigateToConstaterRapport = (id_demande_intervention: string) => {
    router.push(`/vehicule/intervention/rapport/${id_demande_intervention}`)
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={navigateBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              title="Retour à la liste des véhicules"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </button>

            <h2 className="text-lg font-semibold text-gray-800">Liste des Demandes d'Intervention</h2>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

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

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter) && (
              <button
                onClick={clearFilters}
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
        {(searchTerm || statusFilter) && (
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <FilterIcon className="h-4 w-4 mr-2" />
            <span className="mr-2">Filtres actifs:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                Recherche: {searchTerm}
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                Statut: {statusFilter}
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
              >
                Options
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID Demande
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nature Panne
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nature Travaux
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Urgence
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <LoaderIcon className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                    <p className="text-lg font-medium">Chargement des demandes...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Aucune demande trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm || statusFilter
                        ? "Essayez de modifier vos filtres"
                        : "Ajoutez des demandes pour les voir apparaître ici"}
                    </p>
                    {(searchTerm || statusFilter) && (
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
              currentItems.map((demande) => (
                <tr key={demande.id_demande_intervention} className={`hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" color="black" />
                          <span className="sr-only">Options</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-200 shadow-lg rounded-md py-1">
                        {userPrivs.includes("ajouter_QI") && demande.etat_demande === "incomplet" && (
                          <DropdownMenuItem 
                          onClick={() => navigateToCompleterForm(demande.id_demande_intervention)}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                            Compléter Demande
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigateToConstaterDemande(demande.id_demande_intervention)}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                          Constater Demande
                        </DropdownMenuItem>
                        {userPrivs.includes("ajouter_rapport") &&
                          demande.etat_demande.toLowerCase() === "en instance" && (
                            <DropdownMenuItem onClick={() => navigateToRapport(demande.id_demande_intervention)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                              Ajouter Rapport
                            </DropdownMenuItem>
                          )}
                        {demande.etat_demande.toLowerCase() === "complété" && (
                          <DropdownMenuItem onClick={() => navigateToConstaterRapport(demande.id_demande_intervention)}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                            Constater Rapport
                          </DropdownMenuItem>
                        )}
                        {userPrivs.includes("supprimer_DI") &&  demande.etat_demande.toLowerCase() !="complété" &&(
                          <DropdownMenuItem
                            onClick={() => handleDeleteConfirmation("demande", demande.id_demande_intervention)}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                            Supprimer Demande
                          </DropdownMenuItem>
                        )}
                        {userPrivs.includes("supprimer_rapport") &&
                          demande.etat_demande.toLowerCase() === "complété" && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteConfirmation("rapport", demande.id_demande_intervention)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                              Supprimer Rapport
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {demande.id_demande_intervention}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(demande.date_application).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.nature_panne}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.nature_travaux}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${
                        demande.etat_demande === "En instance"
                          ? "bg-yellow-100 text-yellow-800"
                          : demande.etat_demande === "rapport"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {demande.etat_demande}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${
                        demande.degre_urgence === "Urgent"
                          ? "bg-red-100 text-red-800"
                          : demande.degre_urgence === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
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

      {/* Custom Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmedDelete}
        title="Confirmation de suppression"
        description={
          deleteType === "rapport"
            ? "Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action ne peut pas être annulée."
            : "Êtes-vous sûr de vouloir supprimer cette demande d'intervention ? Cette action ne peut pas être annulée."
        }
      />

      {/* Custom Toast */}
      {toast.visible && (
        <Toast title={toast.title} description={toast.description} variant={toast.variant} onClose={closeToast} />
      )}
    </div>
  )
}
