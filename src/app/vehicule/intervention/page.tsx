"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  MoreVertical,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

type DemandeIntervention = {
  id_demande_intervention: string
  etat_demande: string
  date_application: string
  date_heure_panne: string
  structure_maintenance: string
  nature_panne: string
  nature_travaux: string
  degre_urgence: string
  code_vehicule: string
  description?: string
}

export default function InterventionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code_vehicule = searchParams.get("code_vehicule")

  const [demandes, setDemandes] = useState<DemandeIntervention[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vehiculeInfo, setVehiculeInfo] = useState<{
    code_vehicule: string
    marque_designation?: string
    type_designation?: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!code_vehicule) {
      router.push("/vehicule")
      return
    }

    fetchVehiculeInfo()
    fetchDemandes()
  }, [code_vehicule])

  const fetchVehiculeInfo = async () => {
    try {
      const res = await fetch("/api/vehicule/getVehiculeInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des informations du véhicule")
      }

      const data = await res.json()
      setVehiculeInfo(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  const fetchDemandes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/intervention/getDemandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des demandes d'intervention")
      }

      const data = await res.json()
      setDemandes(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(demandes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = demandes.slice(startIndex, endIndex)

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "qualification":
        return "bg-blue-100 text-blue-800"
      case "rapport":
        return "bg-yellow-100 text-yellow-800"
      case "terminé":
      case "termine":
      case "terminée":
      case "terminee":
        return "bg-green-100 text-green-800"
      case "en cours":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/vehicule")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux véhicules
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Demandes d'intervention</CardTitle>
            <CardDescription>
              {vehiculeInfo ? (
                <>
                  Véhicule: <span className="font-medium">{vehiculeInfo.code_vehicule}</span>
                  {vehiculeInfo.marque_designation && vehiculeInfo.type_designation && (
                    <>
                      {" "}
                      - {vehiculeInfo.marque_designation} {vehiculeInfo.type_designation}
                    </>
                  )}
                </>
              ) : (
                "Chargement des informations du véhicule..."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/vehicule/intervention/demande?code_vehicule=${code_vehicule}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ajouter une demande
              </Button>

              <Button variant="outline" onClick={fetchDemandes} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Actualiser
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Chargement des demandes d'intervention...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg font-medium text-red-500">Erreur lors du chargement des demandes</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <Button onClick={fetchDemandes} className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              </div>
            ) : demandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">Aucune demande d'intervention trouvée</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Ce véhicule n'a pas encore de demandes d'intervention. Vous pouvez en ajouter une en cliquant sur le
                  bouton ci-dessus.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nature
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgence
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          État
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((demande) => (
                        <tr key={demande.id_demande_intervention} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {demande.id_demande_intervention}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatDate(demande.date_application)}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{demande.nature_panne}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{demande.degre_urgence}</td>
                          <td className="px-4 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(demande.etat_demande)}`}
                            >
                              {demande.etat_demande}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/vehicule/intervention/details?id=${demande.id_demande_intervention}`)
                                  }
                                >
                                  Détails
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/vehicule/intervention/constater?id=${demande.id_demande_intervention}`,
                                    )
                                  }
                                >
                                  Constater demande
                                </DropdownMenuItem>

                                {demande.etat_demande === "En cours" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/vehicule/intervention/completer?id=${demande.id_demande_intervention}`,
                                      )
                                    }
                                  >
                                    Compléter demande
                                  </DropdownMenuItem>
                                )}

                                {demande.etat_demande === "rapport" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/vehicule/intervention/rapport?id_demande_intervention=${demande.id_demande_intervention}`,
                                      )
                                    }
                                  >
                                    Ajouter rapport
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Affichage de {startIndex + 1}-{Math.min(endIndex, demandes.length)} sur {demandes.length} demandes
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Page précédente</span>
                      </Button>

                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={currentPage === index + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Page suivante</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
