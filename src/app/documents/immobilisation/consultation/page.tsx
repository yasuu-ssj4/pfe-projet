"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Printer, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, addWeeks } from "date-fns"
import { fr } from "date-fns/locale"

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
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null)
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

          // Set the first district as active if there are any
          if (Object.keys(grouped).length > 0) {
            setActiveDistrict(Object.keys(grouped)[0])
          }
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

  const selectDistrict = (district: string) => {
    setActiveDistrict(district)
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
  const getTotalPages = (district: string) => {
    let totalItems = 0

    // Count all immobilisations across all centres in this district
    Object.values(groupedData[district]?.centres || {}).forEach((centre) => {
      totalItems += centre.immobilisations.length
    })

    return Math.ceil(totalItems / itemsPerPage)
  }

  // Format current date for the report header
  const formatCurrentDate = (): string => {
    return format(new Date(), "dd/MM/yyyy", { locale: fr })
  }

  const nextWeek = format(addWeeks(new Date(), 1), "dd/MM/yyyy", { locale: fr })
  const filteredData = getFilteredData()

  return (
    <div className="min-h-screen bg-white">
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Set landscape orientation and hide sidebar */
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          
          /* Hide sidebar and navigation */
          body > div > div:first-child,
          nav,
          aside,
          header,
          footer,
          .print-hide {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Force each district to start on a new page */
          .district-container {
            page-break-before: always;
            page-break-after: always;
            page-break-inside: avoid;
            margin-left: 0 !important;
            padding-left: 0 !important;
            width: 100% !important;
          }
          
          /* Ensure tables don't break across pages */
          table {
            page-break-inside: avoid;
            width: 100% !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          
          /* Hide pagination controls */
          .pagination-controls {
            display: none !important;
          }
          
          /* Make sure the content is visible */
          .print-show {
            display: block !important;
          }
          
          /* Ensure the container takes full width */
          .container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Remove any left margin or padding */
          .ml-4,
          .ml-0,
          .mx-auto {
            margin-left: 0 !important;
          }
          
          /* Ensure proper table column widths */
          th, td {
            padding: 4px 8px !important;
          }
          
          th:nth-child(1), td:nth-child(1) { width: 8% !important; } /* SCD */
          th:nth-child(2), td:nth-child(2) { width: 10% !important; } /* VEHICULE */
          th:nth-child(3), td:nth-child(3) { width: 10% !important; } /* DATE */
          th:nth-child(4), td:nth-child(4) { width: 15% !important; } /* LIEU */
          th:nth-child(5), td:nth-child(5) { width: 25% !important; } /* CAUSES */
          th:nth-child(6), td:nth-child(6) { width: 22% !important; } /* ACTIONS */
          th:nth-child(7), td:nth-child(7) { width: 10% !important; } /* ECHEANCE */
          
          /* Show all districts for printing */
          .district-container {
            display: block !important;
          }
          
          /* Hide district selector in print */
          .district-selector {
            display: none !important;
          }
          
          /* Add page numbers */
          .page-number:after {
            content: counter(page);
          }
          
          /* Copyright footer */
          .copyright {
            text-align: center;
            font-size: 8pt;
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
        }
      `}</style>

      {/* Header - Not printed */}
      <div className="bg-[#0a2d5e] text-white p-4 print-hide">
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
          <>
            {/* District selector - Web view only */}
            <div className="district-selector mb-6 print:hidden">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filteredData).map(([districtCode, district]) => (
                  <button
                    key={districtCode}
                    onClick={() => selectDistrict(districtCode)}
                    className={`px-4 py-2 rounded-md ${
                      activeDistrict === districtCode
                        ? "bg-[#0a2d5e] text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {district.designation}
                  </button>
                ))}
              </div>
            </div>

            {/* Districts content */}
            <div className="space-y-8">
              {Object.entries(filteredData).map(([districtCode, district], districtIndex) => (
                <div
                  key={districtCode}
                  className={`district-container ${activeDistrict === districtCode || !activeDistrict ? "" : "hidden print:block"}`}
                >
                  {/* Report header - visible in both screen and print */}
                  <div className="report-header border border-gray-800 mb-4 grid grid-cols-3">
                    <div className="border border-gray-800 p-4 flex items-center justify-center">
                      <div className="text-center">
                        <img src="/logo-naftal.png" alt="NAFTAL Logo" className="h-12 mx-auto mb-1" />
                        <div className="font-semibold text-xs">DIRECTION GENERALE</div>
                      </div>
                    </div>
                    <div className="border border-gray-800 p-4 flex items-center justify-center">
                      <h2 className="text-xl font-bold text-center">SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE</h2>
                    </div>
                    <div className="border border-gray-800 p-4">
                      <div className="font-semibold border-b border-black pb-1 mb-1 text-right">EQ BGPL MT 33 v1</div>
                      <div className="text-right">
                        <div className="font-semibold">Date d&apos;application : {formatCurrentDate()}</div>
                        <div className="mt-1">
                          Page : {districtIndex + 1} sur {Object.keys(filteredData).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mb-4">
                    <p>
                      <span className="font-semibold">DISTRICT:</span> {district.designation}
                    </p>
                    <p>
                      <span className="font-semibold">ARRETEE AU:</span> {nextWeek}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(district.centres).map(([centreCode, centre]) => {
                      const totalPages = getTotalPages(districtCode)
                      const currentPage = districtPages[districtCode] || 1

                      // Get all immobilisations for this district
                      let allDistrictImmobilisations: ImmobilisationHistorique[] = []
                      Object.values(district.centres).forEach((c) => {
                        allDistrictImmobilisations = [...allDistrictImmobilisations, ...c.immobilisations]
                      })

                      // Paginate all immobilisations for this district
                      const startIndex = (currentPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      const paginatedDistrictImmobilisations = allDistrictImmobilisations.slice(startIndex, endIndex)

                      // Filter immobilisations for this centre from the paginated district immobilisations
                      const paginatedCentreImmobilisations = paginatedDistrictImmobilisations.filter(
                        (item) => item.code_centre === centreCode,
                      )

                      // Skip rendering if there are no immobilisations for this centre in the current page
                      if (paginatedCentreImmobilisations.length === 0 && !activeDistrict) {
                        return null
                      }

                      return (
                        <div key={centreCode} className="ml-0 print:ml-0">
                          <h3 className="text-lg font-semibold mb-3">{centre.designation}</h3>

                          {/* Web view table with pagination */}
                          <div className="overflow-x-auto print:hidden">
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
                                {paginatedCentreImmobilisations.map((item, index) => (
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
                                {centre.immobilisations.map((item, index) => (
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
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination - Web view only */}
                  {getTotalPages(districtCode) > 1 && (
                    <div className="flex justify-between items-center mt-6 pagination-controls print:hidden">
                      <div className="text-sm text-gray-500">
                        Page {districtPages[districtCode] || 1} sur {getTotalPages(districtCode)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => changePage(districtCode, Math.max(1, (districtPages[districtCode] || 1) - 1))}
                          disabled={(districtPages[districtCode] || 1) === 1}
                          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Précédent
                        </button>
                        <button
                          onClick={() =>
                            changePage(
                              districtCode,
                              Math.min(getTotalPages(districtCode), (districtPages[districtCode] || 1) + 1),
                            )
                          }
                          disabled={(districtPages[districtCode] || 1) === getTotalPages(districtCode)}
                          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
                        >
                          Suivant
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Print footer - Only visible when printing */}
                  <div className="hidden print:block print:mt-8 print:border-t print:pt-4">
                    <div className="flex justify-between">
                      <p>Document généré le {formatCurrentDate()}</p>
                      <p>Propriété NAFTAL GPL - Reproduction Interdite</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
