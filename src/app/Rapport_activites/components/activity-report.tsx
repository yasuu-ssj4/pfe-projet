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
  const [allSections, setAllSections] = useState<any[]>([])
  const [currentSection, setCurrentSection] = useState<any | null>(null)
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

    // Flatten the structure to get all sections
    const sections: {
      district: string
      center: string
      maintenanceType: {
        type: string
        items: any[]
      }
    }[] = []

    result.forEach((district) => {
      district.centers.forEach((center) => {
        center.maintenanceTypes.forEach((type) => {
          sections.push({
            district: district.district,
            center: center.name,
            maintenanceType: type,
          })
        })
      })
    })

    setAllSections(sections)
    setTotalPages(sections.length)

    // Set initial current section
    if (sections.length > 0) {
      setCurrentSection(sections[0])
    }
  }, [data])

  // Update current section when page changes
  useEffect(() => {
    if (allSections.length > 0 && currentPage <= allSections.length) {
      setCurrentSection(allSections[currentPage - 1])
    }
  }, [currentPage, allSections])

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

  // Handle printing - this ensures only the current page is printed
  const handlePrint = () => {
    window.print()
  }

  if (!selectedDate || !currentSection) return null

  const monthName = selectedDate ? getMonthName(selectedDate.split("/")[0]) : ""
  const year = selectedDate ? getYear(selectedDate) : ""

  // Split items into chunks of 10 for pagination
  const renderTableContent = () => {
    const items = currentSection.maintenanceType.items
    const rowsPerPage = 13
    const totalItems = items.length
    const totalTables = Math.ceil(totalItems / rowsPerPage)
    const tables = []

    for (let i = 0; i < totalTables; i++) {
      const startIndex = i * rowsPerPage
      const endIndex = Math.min(startIndex + rowsPerPage, totalItems)
      const tableItems = items.slice(startIndex, endIndex)

      const totalPDR = tableItems.reduce((sum: number, item: any) => sum + (Number(item.cout) || 0), 0)
      const totalMO = tableItems.reduce((sum: number, item: any) => sum + (item.cout_main || 0), 0)

      tables.push(
        <div key={`table-${i}`} className={i > 0 ? "page-break mt-8" : ""}>
          {i > 0 && (
            <>
              {/* Repeat header info for continuation pages */}
              <div className="report-header">
                <div className="report-header-cell flex items-center justify-center">
                  <div className="text-center">
                    <img src="/logo-naftal.png" alt="NAFTAL Logo" className="h-12 mx-auto mb-1" />
                    <div className="font-semibold text-xs">DIRECTION GENERALE</div>
                  </div>
                </div>
                <div className="report-header-cell report-title">RAPPORT D'ACTIVITE MAINTENANCE MENSUEL</div>
                <div className="report-header-cell">
                  <div className="report-ref font-semibold border-b border-black pb-1 mb-1">EQ BGPL MT 04 V2</div>
                  <div className="report-date">
                    <div className="font-semibold">Date d'application : {formatCurrentDate()}</div>
                    <div className="report-page mt-1">
                      Page : {currentPage} sur {totalPages}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="font-bold">DISTRICT : {currentSection.district}</div>
                <div className="font-bold">CENTRE : {currentSection.center}</div>
                <div className="font-bold">MOIS : {monthName}</div>
                <div className="font-bold">ANNÉE : {year}</div>
              </div>
              <div className="font-bold mb-4 text-center">
                OPERATIONS DE {currentSection.maintenanceType.type.toUpperCase()} (SUITE)
              </div>
            </>
          )}

          <table className="w-full border-collapse border border-gray-800 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 p-1">Activité(MIF /MRO/CAN)</th>
                <th className="border border-gray-800 p-1">Ensemble / Code</th>
                <th className="border border-gray-800 p-1">S. ensemble / Organe</th>
                <th className="border border-gray-800 p-1">Travaux effectués</th>
                <th className="border border-gray-800 p-1">PDR Consommée</th>
                <th className="border border-gray-800 p-1">Référence PDR</th>
                <th className="border border-gray-800 p-1">N. heures interv.</th>
                <th className="border border-gray-800 p-1" colSpan={3}>
                  Coût de l'intervention
                </th>
              </tr>
              <tr>
                <th className="border border-gray-800 p-1" colSpan={7}></th>
                <th className="border border-gray-800 p-1">PDR</th>
                <th className="border border-gray-800 p-1">M. Oeuvre</th>
                <th className="border border-gray-800 p-1">Autre</th>
              </tr>
            </thead>
            <tbody>
              {tableItems.map((item: any, itemIndex: number) => (
                <tr key={`item-${i}-${itemIndex}`}>
                  <td className="border border-gray-800 p-1 text-center">MRO</td>
                  <td className="border border-gray-800 p-1 text-center">{item.code_vehicule}</td>
                  <td className="border border-gray-800 p-1"></td>
                  <td className="border border-gray-800 p-1">{item.description || "-"}</td>
                  <td className="border border-gray-800 p-1">{item.PDR_consommee || "-"}</td>
                  <td className="border border-gray-800 p-1">{item.reference_bc_bm_btm || "-"}</td>
                  <td className="border border-gray-800 p-1 text-center">{item.duree_travaux}</td>
                  <td className="border border-gray-800 p-1 text-right">{item.cout ? item.cout : "0,00"}</td>
                  <td className="border border-gray-800 p-1 text-right">{item.cout_main}</td>
                  <td className="border border-gray-800 p-1 text-right">-</td>
                </tr>
              ))}

              {/* Only show totals on the last table */}
              {i === totalTables - 1 && (
                <tr className="font-bold">
                  <td className="border border-gray-800 p-1 text-right" colSpan={7}>
                    Total :
                  </td>
                  <td className="border border-gray-800 p-1 text-right">{totalPDR}</td>
                  <td className="border border-gray-800 p-1 text-right">{totalMO}</td>
                  <td className="border border-gray-800 p-1 text-right">-</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Only add operations count and signatures on the last table */}
          {i === totalTables - 1 && (
            <>
              {/* Operations count section */}
              <div className="operations-count print-only">
                <div className="operations-count-cell">Nbre d'opérations programmées durant le mois :</div>
                <div className="operations-count-cell">Nbre d'opérations réalisée durant le mois :</div>
                <div className="operations-count-cell">Nbre d'opérations cumulées fin du mois :</div>
                <div className="operations-count-cell"></div>
              </div>

              {/* Signature section */}
              <div className="signature-section print-only">
                <div className="signature-left">
                  <div className="signature-line">
                    <span>Etabli par :</span>
                    <hr />
                  </div>
                  <div className="signature-line">
                    <span>Le Chef de Département Technique :</span>
                    <hr />
                  </div>
                </div>
                <div className="signature-right">
                  <div className="signature-line">
                    <span>Approuvé par :</span>
                    <hr />
                  </div>
                  <div className="signature-line">
                    <span>Le Directeur :</span>
                    <hr />
                  </div>
                </div>
              </div>

              {/* Copyright notice */}
              <div className="copyright print-only">Propriété NAFTAL GPL - Reproduction Interdite</div>
            </>
          )}
        </div>,
      )
    }

    return tables
  }

  return (
    <div className="space-y-8">
      {/* Print-specific styles */}
      <style jsx global>{`
  .print-only {
    display: none;
  }

  @media print {
    .print-only {
      display: block;
    }
    @page {
      size: landscape;
      margin: 0.5cm;
    }
    
    body {
      font-size: 9pt;
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
      margin-top: 1cm;
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
    
    thead {
      display: table-header-group;
    }
    
    tfoot {
      display: table-footer-group;
    }
    
    tr {
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 3px;
      font-size: 8pt;
    }
    
    th {
      background-color: #f3f4f6 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Ensure background colors print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .report-header {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      border: 1px solid #000;
      margin-bottom: 10px;
    }
    
    .report-header-cell {
      border: 1px solid #000;
      padding: 5px;
      font-size: 8pt;
    }
    
    .report-title {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .report-ref {
      text-align: right;
      font-size: 8pt;
    }
    
    .report-date {
      font-size: 8pt;
      text-align: right;
    }
    
    .report-page {
      font-size: 8pt;
      text-align: right;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-top: 30px;
      font-size: 8pt;
    }
    
    .signature-left, .signature-right {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .signature-line {
      display: flex;
      align-items: center;
    }
    
    .signature-line span {
      margin-right: 10px;
    }
    
    .signature-line hr {
      flex-grow: 1;
      border: none;
      border-bottom: 1px solid #000;
    }
    
    .operations-count {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #000;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .operations-count-cell {
      border: 1px solid #000;
      padding: 5px;
      font-size: 8pt;
    }
    
    .copyright {
      text-align: center;
      font-size: 8pt;
      margin-top: 20px;
      border-top: 1px solid #000;
      padding-top: 5px;
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
        {/* Report header - visible in both screen and print */}
        <div className="report-header">
          <div className="report-header-cell flex items-center justify-center">
            <div className="text-center">
              <img src="/logo-naftal.png" alt="NAFTAL Logo" className="h-12 mx-auto mb-1" />
              <div className="font-semibold text-xs">DIRECTION GENERALE</div>
            </div>
          </div>
          <div className="report-header-cell report-title">RAPPORT D'ACTIVITE MAINTENANCE MENSUEL</div>
          <div className="report-header-cell">
            <div className="report-ref font-semibold border-b border-black pb-1 mb-1">EQ BGPL MT 04 V2</div>
            <div className="report-date">
              <div className="font-semibold">Date d'application : {formatCurrentDate()}</div>
              <div className="report-page mt-1">
                Page : {currentPage} sur {totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Report info */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="font-bold">DISTRICT : {currentSection.district}</div>
          <div className="font-bold">CENTRE : {currentSection.center}</div>
          <div className="font-bold">MOIS : {monthName}</div>
          <div className="font-bold">ANNÉE : {year}</div>
        </div>

        {/* Maintenance type header */}
        <div className="font-bold mb-4 text-center">
          OPERATIONS DE {currentSection.maintenanceType.type.toUpperCase()}
        </div>

        {/* Render the current table */}
        {renderTableContent()}
      </div>
    </div>
  )
}
