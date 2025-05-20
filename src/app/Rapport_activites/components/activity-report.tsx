"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ActivityReportProps {
  data: any[]
  selectedDate: string | null
}

interface GroupedData {
  district: string
  centers: {
    name: string
    maintenanceTypes: {
      type: string
      items: any[]
    }[]
  }[]
}

export default function ActivityReport({ data, selectedDate }: ActivityReportProps) {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const itemsPerPage = 10

  // Group data by district, center, and maintenance type
  useEffect(() => {
    if (!data || data.length === 0) return

    const grouped: { [key: string]: any } = {}

    // First, group by district
    data.forEach((item) => {
      const districtKey = item.nom_district
      if (!grouped[districtKey]) {
        grouped[districtKey] = {
          district: districtKey,
          centers: {},
        }
      }

      // Then by center
      const centerKey = item.designation
      if (!grouped[districtKey].centers[centerKey]) {
        grouped[districtKey].centers[centerKey] = {
          name: centerKey,
          maintenanceTypes: {},
        }
      }

      // Then by maintenance type
      const typeKey = item.nature_travaux
      if (!grouped[districtKey].centers[centerKey].maintenanceTypes[typeKey]) {
        grouped[districtKey].centers[centerKey].maintenanceTypes[typeKey] = {
          type: typeKey,
          items: [],
        }
      }

      // Add the item to the appropriate group
      grouped[districtKey].centers[centerKey].maintenanceTypes[typeKey].items.push(item)
    })

    // Convert the nested objects to arrays for easier rendering
    const result: GroupedData[] = Object.values(grouped).map((district: any) => {
      return {
        district: district.district,
        centers: Object.values(district.centers).map((center: any) => {
          return {
            name: center.name,
            maintenanceTypes: Object.values(center.maintenanceTypes),
          }
        }),
      }
    })

    setGroupedData(result)

    // Calculate total pages - each district/center/type combination gets its own page
    let totalSections = 0
    result.forEach((district) => {
      district.centers.forEach((center) => {
        totalSections += center.maintenanceTypes.length
      })
    })

    setTotalPages(Math.max(1, totalSections))
  }, [data])

  // Handle pagination
  useEffect(() => {
    if (groupedData.length === 0) return

    // Flatten the structure to get all sections
    const allSections: {
      district: string
      center: string
      maintenanceType: {
        type: string
        items: any[]
      }
    }[] = []

    groupedData.forEach((district) => {
      district.centers.forEach((center) => {
        center.maintenanceTypes.forEach((type) => {
          allSections.push({
            district: district.district,
            center: center.name,
            maintenanceType: type,
          })
        })
      })
    })

    // Get the current section
    if (currentPage <= allSections.length) {
      const currentSection = allSections[currentPage - 1]

      // Create a structure for the current page only
      const currentPageData = [
        {
          district: currentSection.district,
          centers: [
            {
              name: currentSection.center,
              maintenanceTypes: [currentSection.maintenanceType],
            },
          ],
        },
      ]

      setPaginatedData(currentPageData)
    } else {
      setPaginatedData([])
    }
  }, [groupedData, currentPage])

  // Get month name from the selected date
  const getMonthName = (monthNumber: string): string => {
    const months = [
      "JANVIER",
      "FÉVRIER",
      "MARS",
      "AVRIL",
      "MAI",
      "JUIN",
      "JUILLET",
      "AOÛT",
      "SEPTEMBRE",
      "OCTOBRE",
      "NOVEMBRE",
      "DÉCEMBRE",
    ]
    return months[Number.parseInt(monthNumber) - 1]
  }

  // Get year from the selected date
  const getYear = (date: string): string => {
    return date.split("/")[1]
  }

  // Format current date for the report header
  const formatCurrentDate = (): string => {
    const now = new Date()
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (!selectedDate) return null

  const monthName = selectedDate ? getMonthName(selectedDate.split("/")[0]) : ""
  const year = selectedDate ? getYear(selectedDate) : ""

  return (
    <div className="space-y-8">
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          
          body {
            font-size: 10pt;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .print-hidden {
            display: none !important;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 9pt;
          }
          
          th {
            background-color: #f3f4f6;
          }
        }
      `}</style>

      {/* Pagination controls - hidden when printing */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="text-sm text-gray-500">
          Page {currentPage} sur {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="print-container">
        {paginatedData.map((district, districtIndex) => (
          <div key={`district-${districtIndex}`}>
            {district.centers.map((center: GroupedData["centers"][number], centerIndex: number) => (
              <div key={`center-${centerIndex}`}>
                {center.maintenanceTypes.map((maintenanceType, typeIndex) => (
                  <div key={`type-${typeIndex}`}>
                    {/* Report header */}
                    <div className="border-2 border-gray-800 mb-4 print:hidden">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="border-2 border-gray-800 p-0 w-60 h-24">
                              <img
                                src="/logo-naftal.png"
                                alt="NAFTAL Logo"
                                className="w-full h-full object-contain p-2"
                              />
                            </td>
                            <td className="border-2 border-gray-800 px-7 py-5 w-140 text-2xl font-bold text-center">
                              <h2>RAPPORT D'ACTIVITE MAINTENANCE MENSUEL</h2>
                            </td>
                            <td className="border-2 border-gray-800 w-60">
                              <div className="border-b-2 border-gray-800 text-center font-semibold">
                                EQ BGPL MT 04 V2
                              </div>
                              <div className="pt-2">
                                <div className="font-semibold">Date d'application :</div>
                                <div className="text-center mt-1">{formatCurrentDate()}</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Report info */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-lg font-bold">DISTRICT : {district.district}</div>
                      <div className="text-lg font-bold">CENTRE : {center.name}</div>
                      <div className="text-lg font-bold">MOIS : {monthName}</div>
                      <div className="text-lg font-bold">ANNÉE : {year}</div>
                    </div>

                    {/* Maintenance type header */}
                    <div className="text-lg font-bold mb-4 text-center">
                      OPERATIONS DE {maintenanceType.type.toUpperCase()}
                    </div>

                    {/* Maintenance data table */}
                    <table className="w-full border-collapse border-2 border-gray-800 mb-8">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-800 p-2">Activité (MIF/MRO/CAN)</th>
                          <th className="border border-gray-800 p-2">Ensemble / Code</th>
                          <th className="border border-gray-800 p-2">S. ensemble / Organe</th>
                          <th className="border border-gray-800 p-2">Travaux effectués</th>
                          <th className="border border-gray-800 p-2">PDR Consommée</th>
                          <th className="border border-gray-800 p-2">Référence PDR</th>
                          <th className="border border-gray-800 p-2">N. heures interv.</th>
                          <th className="border border-gray-800 p-2" colSpan={3}>
                            Coût de l'intervention
                          </th>
                        </tr>
                        <tr>
                          <th className="border border-gray-800 p-2" colSpan={7}></th>
                          <th className="border border-gray-800 p-2">PDR</th>
                          <th className="border border-gray-800 p-2">M. Oeuvre</th>
                          <th className="border border-gray-800 p-2">Autre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceType.items.map((item, itemIndex) => (
                          <tr key={`item-${itemIndex}`}>
                            <td className="border border-gray-800 p-2 text-center">MRO</td>
                            <td className="border border-gray-800 p-2 text-center">{item.code_vehicule}</td>
                            <td className="border border-gray-800 p-2"></td>
                            <td className="border border-gray-800 p-2">{item.description || "-"}</td>
                            <td className="border border-gray-800 p-2">{item.PDR_consommee || "-"}</td>
                            <td className="border border-gray-800 p-2">{item.reference_bc_bm_btm || "-"}</td>
                            <td className="border border-gray-800 p-2 text-center">{item.duree_travaux}</td>
                            <td className="border border-gray-800 p-2 text-right">{item.cout ? item.cout : "0,00"}</td>
                            <td className="border border-gray-800 p-2 text-right">{item.cout_main}</td>
                            <td className="border border-gray-800 p-2 text-right">-</td>
                          </tr>
                        ))}

                        {/* Calculate totals */}
                        {(() => {
                          const totalPDR = maintenanceType.items.reduce((sum, item) => sum + (item.cout || 0), 0)
                          const totalMO = maintenanceType.items.reduce((sum, item) => sum + (item.cout_main || 0), 0)

                          return (
                            <tr className="font-bold">
                              <td className="border border-gray-800 p-2 text-right" colSpan={7}>
                                Total :
                              </td>
                              <td className="border border-gray-800 p-2 text-right">{totalPDR}</td>
                              <td className="border border-gray-800 p-2 text-right">{totalMO}</td>
                              <td className="border border-gray-800 p-2 text-right">-</td>
                            </tr>
                          )
                        })()}
                      </tbody>
                    </table>

                    {/* Page footer */}
                    <div className="text-xs text-gray-500 flex justify-between mt-8">
                      <span>Date d'édition : {formatCurrentDate()}</span>
                      <span>Propriété NAFTAL GPL - Reproduction interdite</span>
                      <span>
                        Page {currentPage} sur {totalPages}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
