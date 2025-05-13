"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Printer, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, addWeeks } from "date-fns"
import { fr } from "date-fns/locale"
import "./print.css" // Import the CSS file

// Helper function to get current user ID (placeholder)
const getCurrentUserId = () => {
  // In a real app, this would come from your auth system
  return 2 // Replace with actual user ID retrieval
}

type ImmobilisationHistorique = {
  code_district: string
  designation_district: string
  code_centre: string
  designation_centre: string
  code_vehicule: string
  date_immobilisation: string
  cause_immobilisation: string
  lieu: string
  action: string
  echeance: string | null
}

type GroupedImmobilisations = {
  [district: string]: {
    designation: string
    centres: {
      [centre: string]: {
        designation: string
        immobilisations: ImmobilisationHistorique[]
      }
    }
  }
}

export default function HistoriqueImmobilisationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [immobilisations, setImmobilisations] = useState<ImmobilisationHistorique[]>([])
  const [groupedData, setGroupedData] = useState<GroupedImmobilisations>({})
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({})
  const [districtPages, setDistrictPages] = useState<Record<string, number>>({})
  const itemsPerPage = 15

  useEffect(() => {
    const fetchImmobilisationHistory = async () => {
      try {
        setLoading(true)
        const userId = getCurrentUserId()
        const response = await fetch("/api/immobilisation/historiqueImmobilisations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch immobilisation history")
        }

        const data = await response.json()
        console.log("Fetched immobilisation history:", data)

        if (data.immobilizedVehicles && Array.isArray(data.immobilizedVehicles)) {
          setImmobilisations(data.immobilizedVehicles)

          // Group data by district and centre
          const grouped: GroupedImmobilisations = {}

          data.immobilizedVehicles.forEach((item: ImmobilisationHistorique) => {
            if (!grouped[item.code_district]) {
              grouped[item.code_district] = {
                designation: item.designation_district,
                centres: {},
              }
            }

            if (!grouped[item.code_district].centres[item.code_centre]) {
              grouped[item.code_district].centres[item.code_centre] = {
                designation: item.designation_centre,
                immobilisations: [],
              }
            }

            grouped[item.code_district].centres[item.code_centre].immobilisations.push(item)
          })

          setGroupedData(grouped)

          // Initialize all districts as expanded and set page 1 for each
          const expanded: Record<string, boolean> = {}
          const pages: Record<string, number> = {}
          Object.keys(grouped).forEach((district) => {
            expanded[district] = true
            pages[district] = 1
          })
          setExpandedDistricts(expanded)
          setDistrictPages(pages)
        }
      } catch (error) {
        console.error("Error fetching immobilisation history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImmobilisationHistory()
  }, [])

  // Filter immobilisations based on search term
  const getFilteredData = () => {
    if (!searchTerm.trim()) return groupedData

    const filtered: GroupedImmobilisations = {}

    Object.entries(groupedData).forEach(([districtCode, district]) => {
      const filteredCentres: {
        [centre: string]: {
          designation: string
          immobilisations: ImmobilisationHistorique[]
        }
      } = {}

      Object.entries(district.centres).forEach(([centreCode, centre]) => {
        const filteredImmobilisations = centre.immobilisations.filter(
          (item) =>
            item.code_vehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cause_immobilisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            centre.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            district.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code_centre.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (filteredImmobilisations.length > 0) {
          filteredCentres[centreCode] = {
            designation: centre.designation,
            immobilisations: filteredImmobilisations,
          }
        }
      })

      if (Object.keys(filteredCentres).length > 0) {
        filtered[districtCode] = {
          designation: district.designation,
          centres: filteredCentres,
        }
      }
    })

    return filtered
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
      }
      return format(date, "dd/MM/yyyy", { locale: fr })
    } catch (error) {
      console.error("Error formatting date for display:", error, dateString)
      return dateString
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleDistrict = (district: string) => {
    setExpandedDistricts({
      ...expandedDistricts,
      [district]: !expandedDistricts[district],
    })
  }

  const changePage = (district: string, page: number) => {
    setDistrictPages({
      ...districtPages,
      [district]: page,
    })
  }

  // Get paginated immobilisations for a district
  const getPaginatedImmobilisations = (
    district: string,
    centre: string,
    immobilisations: ImmobilisationHistorique[],
  ) => {
    const currentPage = districtPages[district] || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return immobilisations.slice(startIndex, endIndex)
  }

  // Calculate total pages for a district
  const getTotalPages = (district: string, centre: string, immobilisations: ImmobilisationHistorique[]) => {
    return Math.ceil(immobilisations.length / itemsPerPage)
  }

  const nextWeek = format(addWeeks(new Date(), 1), "dd/MM/yyyy", { locale: fr })
  const filteredData = getFilteredData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Not printed */}
      <div className="bg-[#0a2d5e] text-white p-4 print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents/immobilisation")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">HISTORIQUE D&apos;IMMOBILISATION</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePrint}
              className="flex items-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              <Printer className="mr-2 h-5 w-5" />
              Imprimer
            </button>
            <div className="flex items-center bg-white rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher..."
                className="px-3 py-2 text-black outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-yellow-500 p-2">
                <Search className="h-5 w-5 text-[#0a2d5e]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto my-6 print:my-0 print:mx-0 print:w-full print:max-w-none">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a2d5e]"></div>
          </div>
        ) : Object.keys(filteredData).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune immobilisation trouvée</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredData).map(([districtCode, district], districtIndex) => (
              <div key={districtCode} className="district-container">
                {/* Print Header - Only visible when printing */}
                <div className="hidden print:block print:mb-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <img src="/abstract-logo.png" alt="Logo" className="h-12" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold">DIRECTION GENERALE</h1>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="font-bold">EQ BGPL MT 33 v1</h2>
                      <p>Date d&apos;application : {format(new Date(), "dd/MM/yyyy", { locale: fr })}</p>
                      <p>
                        Page {districtIndex + 1} sur {Object.keys(filteredData).length}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE</h1>
                  </div>
                </div>

                <div className="print:flex print:justify-between print:mt-4 hidden print:block">
                  <p>
                    <span className="font-semibold">DISTRICT:</span> {district.designation}
                  </p>
                  <p>
                    <span className="font-semibold">ARRETEE AU:</span> {nextWeek}
                  </p>
                </div>

                <div className="print:hidden">
                  <button
                    onClick={() => toggleDistrict(districtCode)}
                    className="flex items-center w-full text-left text-xl font-bold mb-4 bg-gray-100 p-3 border-l-4 border-[#0a2d5e]"
                  >
                    <span className="flex-1">DISTRICT: {district.designation}</span>
                    {expandedDistricts[districtCode] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {expandedDistricts[districtCode] && (
                  <div className="space-y-6">
                    {Object.entries(district.centres).map(([centreCode, centre]) => {
                      const totalPages = getTotalPages(districtCode, centreCode, centre.immobilisations)
                      const currentPage = districtPages[districtCode] || 1
                      const paginatedImmobilisations = getPaginatedImmobilisations(
                        districtCode,
                        centreCode,
                        centre.immobilisations,
                      )

                      // For print view, use all immobilisations
                      const printImmobilisations = centre.immobilisations

                      return (
                        <div key={centreCode} className="ml-0 print:ml-0">
                          <h3 className="text-lg font-semibold mb-3 print:hidden">{centre.designation}</h3>

                          {/* Web view table with pagination */}
                          <div className="overflow-x-auto print:hidden">
                            <table className="min-w-full bg-white border border-gray-300">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 border text-left font-semibold">CDS</th>
                                  <th className="px-4 py-2 border text-left font-semibold">VEHICULE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">DATE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">LIEU</th>
                                  <th className="px-4 py-2 border text-left font-semibold">
                                    CAUSES D&apos;IMMOBILISATION
                                  </th>
                                  <th className="px-4 py-2 border text-left font-semibold">ACTIONS ENGAGEES</th>
                                  <th className="px-4 py-2 border text-left font-semibold">ECHEANCE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedImmobilisations.map((item, index) => (
                                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-2 border">{item.code_centre}</td>
                                    <td className="px-4 py-2 border">{item.code_vehicule}</td>
                                    <td className="px-4 py-2 border">
                                      {formatDateForDisplay(item.date_immobilisation)}
                                    </td>
                                    <td className="px-4 py-2 border">{item.lieu}</td>
                                    <td className="px-4 py-2 border">{item.cause_immobilisation}</td>
                                    <td className="px-4 py-2 border">{item.action}</td>
                                    <td className="px-4 py-2 border">{formatDateForDisplay(item.echeance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Print view table without pagination */}
                          <div className="hidden print:block">
                            <table className="min-w-full bg-white border border-gray-300">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 border text-left font-semibold">SCD</th>
                                  <th className="px-4 py-2 border text-left font-semibold">VEHICULE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">DATE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">LIEU</th>
                                  <th className="px-4 py-2 border text-left font-semibold">
                                    CAUSES D&apos;IMMOBILISATION
                                  </th>
                                  <th className="px-4 py-2 border text-left font-semibold">ACTIONS ENGAGEES</th>
                                  <th className="px-4 py-2 border text-left font-semibold">ECHEANCE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {printImmobilisations.map((item, index) => (
                                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-2 border">{item.code_centre}</td>
                                    <td className="px-4 py-2 border">{item.code_vehicule}</td>
                                    <td className="px-4 py-2 border">
                                      {formatDateForDisplay(item.date_immobilisation)}
                                    </td>
                                    <td className="px-4 py-2 border">{item.lieu}</td>
                                    <td className="px-4 py-2 border">{item.cause_immobilisation}</td>
                                    <td className="px-4 py-2 border">{item.action}</td>
                                    <td className="px-4 py-2 border">{formatDateForDisplay(item.echeance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination - Web view only */}
                          {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4 print:hidden">
                              <div className="text-sm text-gray-500">
                                Page {currentPage} sur {totalPages}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => changePage(districtCode, Math.max(1, currentPage - 1))}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
                                >
                                  <ChevronLeft className="h-4 w-4 mr-1" />
                                  Précédent
                                </button>
                                <button
                                  onClick={() => changePage(districtCode, Math.min(totalPages, currentPage + 1))}
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
                                >
                                  Suivant
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Print footer - Only visible when printing */}
                <div className="hidden print:block print:mt-8 print:border-t print:pt-4">
                  <div className="flex justify-between">
                    <p>Document généré le {format(new Date(), "dd/MM/yyyy", { locale: fr })}</p>
                    <p>Système de Gestion de Maintenance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
