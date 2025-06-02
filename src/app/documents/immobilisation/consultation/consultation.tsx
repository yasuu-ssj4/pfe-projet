"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, Search, Printer, ChevronRight, Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { fr } from "date-fns/locale"

// Helper function to get current user ID (placeholder)


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

interface WeekSelectionPopupProps {
  onSelect: (week: string, month: string, year: string) => void
  onCancel: () => void
}

function WeekSelectionPopup({ onSelect, onCancel }: WeekSelectionPopupProps) {
  const currentYear = new Date().getFullYear()
  const [week, setWeek] = useState("1")
  const [month, setMonth] = useState(
    new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`,
  )
  const [year, setYear] = useState(currentYear.toString())
  const [error, setError] = useState<string | null>(null)

  const weeks = [
    { value: "1", label: "Semaine 1 (1-7)" },
    { value: "2", label: "Semaine 2 (8-14)" },
    { value: "3", label: "Semaine 3 (15-21)" },
    { value: "4", label: "Semaine 4 (22-fin)" },
  ]

  const months = [
    { value: "01", label: "Janvier" },
    { value: "02", label: "Février" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Avril" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" },
    { value: "08", label: "Août" },
    { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ]

  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!week || !month || !year) {
      setError("Veuillez sélectionner la semaine, le mois et l'année")
      return
    }

    onSelect(week, month, year)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Sélectionner la période</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">
                Semaine
              </label>
              <select
                id="week"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {weeks.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Mois
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HistoriqueImmobilisationPage({ userId, userPrivs }: { userId: number; userPrivs: string[] }) {
  const router = useRouter()
  const [showDatePopup, setShowDatePopup] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [immobilisations, setImmobilisations] = useState<ImmobilisationHistorique[]>([])
  const [groupedData, setGroupedData] = useState<GroupedImmobilisations>({})
  const [currentDistrictIndex, setCurrentDistrictIndex] = useState(0)
  const [manualWeek, setManualWeek] = useState("")
  const [manualMonth, setManualMonth] = useState("")
  const [manualYear, setManualYear] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Calculate date range for a week
  const getWeekDateRange = (week: string, month: string, year: string) => {
    const monthStart = startOfMonth(new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1))
    const monthEnd = endOfMonth(new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1))

    let startDay: number
    let endDay: number

    switch (week) {
      case "1":
        startDay = 1
        endDay = 7
        break
      case "2":
        startDay = 8
        endDay = 14
        break
      case "3":
        startDay = 15
        endDay = 21
        break
      case "4":
        startDay = 22
        endDay = monthEnd.getDate()
        break
      default:
        startDay = 1
        endDay = 7
    }

    const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, startDay)
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Math.min(endDay, monthEnd.getDate()))

    return {
      start: format(startDate, "dd/MM/yyyy", { locale: fr }),
      end: format(endDate, "dd/MM/yyyy", { locale: fr }),
      startDate,
      endDate,
    }
  }

  // Fetch immobilisation data when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchImmobilisationHistory(selectedDate)
    }
  }, [selectedDate])

  const fetchImmobilisationHistory = async (date: string) => {
    setLoading(true)
    setError(null)

    try {
     
      const response = await fetch("/api/immobilisation/historiqueImmobilisations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, date }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données d'immobilisation")
      }

      const data = await response.json()
      console.log("Fetched immobilisation history:", data)

      if (data.immobilizedVehicles && Array.isArray(data.immobilizedVehicles)) {
        setImmobilisations(data.immobilizedVehicles)

        // Group data by district and centre, sorted by designation
        const grouped: GroupedImmobilisations = {}

        // Sort by district designation first
        const sortedData = [...data.immobilizedVehicles].sort((a, b) => {
          const aDistrict = a.designation_district || ""
          const bDistrict = b.designation_district || ""
          return aDistrict.localeCompare(bDistrict)
        })

        sortedData.forEach((item: ImmobilisationHistorique) => {
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

        // Sort centres by code within each district
        Object.keys(grouped).forEach((districtCode) => {
          const sortedCentres: (typeof grouped)[string]["centres"] = {}
          const centreKeys = Object.keys(grouped[districtCode].centres).sort((a, b) => {
            const aCode = a || ""
            const bCode = b || ""
            return aCode.localeCompare(bCode)
          })

          centreKeys.forEach((centreCode) => {
            sortedCentres[centreCode] = grouped[districtCode].centres[centreCode]
            // Sort immobilisations within each centre by vehicle code with null checks
            sortedCentres[centreCode].immobilisations.sort((a, b) => {
              const aVehicle = a.code_vehicule || ""
              const bVehicle = b.code_vehicule || ""
              return aVehicle.localeCompare(bVehicle)
            })
          })

          grouped[districtCode].centres = sortedCentres
        })

        setGroupedData(grouped)
        setCurrentDistrictIndex(0) // Reset to first district
      } else {
        setImmobilisations([])
        setGroupedData({})
      }
    } catch (err) {
      console.error("Error fetching immobilisation history:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelection = (week: string, month: string, year: string) => {
    const formattedDate = `${week}/${month}/${year}`
    setSelectedDate(formattedDate)
    setSelectedWeek(week)
    setSelectedMonth(month)
    setSelectedYear(year)
    setManualWeek(week)
    setManualMonth(month)
    setSelectedYear(year)
    setShowDatePopup(false)
  }

  const handleManualDateSubmit = () => {
    if (!manualWeek || !manualMonth || !manualYear) return

    const formattedDate = `${manualWeek}/${manualMonth}/${manualYear}`
    setSelectedDate(formattedDate)
    setSelectedWeek(manualWeek)
    setSelectedMonth(manualMonth)
    setSelectedYear(manualYear)
    fetchImmobilisationHistory(formattedDate)
  }

  // Filter immobilisations based on search term
  const getFilteredData = () => {
    if (!searchTerm.trim()) return groupedData

    const filtered: GroupedImmobilisations = {}

    Object.entries(groupedData).forEach(([districtCode, district], districtIndex) => {
      const filteredCentres: {
        [centre: string]: {
          designation: string
          immobilisations: ImmobilisationHistorique[]
        }
      } = {}

      Object.entries(district.centres).forEach(([centreCode, centre]) => {
        const filteredImmobilisations = centre.immobilisations.filter(
          (item) =>
            (item.code_vehicule || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.lieu || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.cause_immobilisation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (centre.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (district.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code_centre || "").toLowerCase().includes(searchTerm.toLowerCase()),
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

  // Get month name from the selected date
  const getMonthName = (monthNumber: string): string => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ]
    return months[Number.parseInt(monthNumber) - 1]
  }

  const formatCurrentDate = (): string => {
    return format(new Date(), "dd/MM/yyyy", { locale: fr })
  }

  // Navigation functions
  const goToNextDistrict = () => {
    const districts = Object.keys(filteredData)
    if (currentDistrictIndex < districts.length - 1) {
      setCurrentDistrictIndex(currentDistrictIndex + 1)
    }
  }

  const goToPreviousDistrict = () => {
    if (currentDistrictIndex > 0) {
      setCurrentDistrictIndex(currentDistrictIndex - 1)
    }
  }

  const filteredData = getFilteredData()
  const dateRange =
    selectedWeek && selectedMonth && selectedYear ? getWeekDateRange(selectedWeek, selectedMonth, selectedYear) : null

  const districts = Object.entries(filteredData)
  const totalDistricts = districts.length
  const currentDistrict = districts[currentDistrictIndex]

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
          
          th:nth-child(1), td:nth-child(1) { width: 10% !important; } /* CDS */
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

          /* Signature section styling */
          .signature-section {
            margin-top: 40px !important;
            page-break-inside: avoid !important;
          }

          /* Ensure signature lines are visible */
          .signature-line {
            border-bottom: 1px solid #000 !important;
            width: 200px !important;
            display: inline-block !important;
          }

          /* Footer styling */
          .print-footer {
            margin-top: 20px !important;
            border-top: 1px solid #000 !important;
            padding-top: 10px !important;
            text-align: center !important;
            font-size: 10pt !important;
          }
        }
      `}</style>

      {showDatePopup && <WeekSelectionPopup onSelect={handleDateSelection} onCancel={() => router.back()} />}

      {!showDatePopup && (
        <>
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
                <div className="w-24"></div>
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

          {/* Controls Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 print-hide">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {selectedDate && (
                <div className="text-xl font-semibold text-gray-800">
                  Historique d'immobilisation - Semaine {selectedWeek} - {getMonthName(selectedMonth)} {selectedYear}
                  {dateRange && (
                    <div className="text-sm text-gray-600 mt-1">
                      Du {dateRange.start} au {dateRange.end}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Manual Date Selection */}
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <select
                      value={manualWeek}
                      onChange={(e) => setManualWeek(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >

                      <option value="1">Semaine 1 (1-7)</option>
                      <option value="2">Semaine 2 (8-14)</option>
                      <option value="3">Semaine 3 (15-21)</option>
                      <option value="4">Semaine 4 (22-fin)</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={manualMonth}
                      onChange={(e) => setManualMonth(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Mois</option>
                      <option value="01">Janvier</option>
                      <option value="02">Février</option>
                      <option value="03">Mars</option>
                      <option value="04">Avril</option>
                      <option value="05">Mai</option>
                      <option value="06">Juin</option>
                      <option value="07">Juillet</option>
                      <option value="08">Août</option>
                      <option value="09">Septembre</option>
                      <option value="10">Octobre</option>
                      <option value="11">Novembre</option>
                      <option value="12">Décembre</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={manualYear}
                      onChange={(e) => setManualYear(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Année</option>
                      {Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    onClick={handleManualDateSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Rechercher
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
                <span className="ml-2 text-gray-600">Chargement des données...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => selectedDate && fetchImmobilisationHistory(selectedDate)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : totalDistricts === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucune immobilisation trouvée</p>
              </div>
            ) : (
              <>
                {/* District Navigation - Web view only */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                  <button
                    onClick={goToPreviousDistrict}
                    disabled={currentDistrictIndex === 0}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    District précédent
                  </button>

                  <div className="text-center">
                    <div className="text-lg font-semibold">{currentDistrict ? currentDistrict[1].designation : ""}</div>
                    <div className="text-sm text-gray-500">
                      Page {currentDistrictIndex + 1} sur {totalDistricts}
                    </div>
                  </div>

                  <button
                    onClick={goToNextDistrict}
                    disabled={currentDistrictIndex === totalDistricts - 1}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    District suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>

                {/* Current District - Web view */}
                {currentDistrict && (
                  <div className="print:hidden">
                    <div className="district-container">
                      {/* Report header */}
                      <div className="report-header border border-gray-800 mb-4 grid grid-cols-3">
                        <div className="border border-gray-800 p-4 flex items-center justify-center">
                          <div className="text-center">
                            <img src="/logo-naftal.png" alt="NAFTAL Logo" className="h-12 mx-auto mb-1" />
                            <div className="font-semibold text-xs">DIRECTION GENERALE</div>
                          </div>
                        </div>
                        <div className="border border-gray-800 p-4 flex items-center justify-center">
                          <h2 className="text-xl font-bold text-center">
                            SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE
                          </h2>
                        </div>
                        <div className="border border-gray-800 p-4">
                          <div className="font-semibold border-b border-black pb-1 mb-1 text-right">
                            EQ BGPL MT 33 v1
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">Date d&apos;application : {formatCurrentDate()}</div>
                            <div className="mt-1">
                              Page : {currentDistrictIndex + 1} sur {totalDistricts}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mb-4">
                        <p>
                          <span className="font-semibold">DISTRICT:</span> {currentDistrict[1].designation}
                        </p>
                        <p>
                          <span className="font-semibold">PERIODE:</span>{" "}
                          {dateRange
                            ? `${dateRange.start} au ${dateRange.end}`
                            : selectedWeek && selectedMonth && selectedYear
                              ? `Semaine ${selectedWeek} - ${getMonthName(selectedMonth)} ${selectedYear}`
                              : "Non définie"}
                        </p>
                      </div>

                      {/* Table for current district */}
                      <div className="space-y-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 border text-left font-semibold">CDS</th>
                                <th className="px-4 py-2 border text-left font-semibold">VEHICULE</th>
                                <th className="px-4 py-2 border text-left font-semibold">DATE</th>
                                <th className="px-4 py-2 border text-left font-semibold">LIEU</th>
                                <th className="px-4 py-2 border text-left font-semibold">CAUSE_IMMOBILISATION</th>
                                <th className="px-4 py-2 border text-left font-semibold">ACTIONS ENGAGEES</th>
                                <th className="px-4 py-2 border text-left font-semibold">ECHEANCE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(currentDistrict[1].centres)
                                .flatMap((centre) => centre.immobilisations)
                                .map((item, index) => (
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

                      {/* Signature section */}
                      <div className="mt-8">
                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <p className="font-semibold mb-8">VERIFIE PAR :</p>
                            <div className="border-b border-black w-64 mb-2"></div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold mb-8">APPROUVE PAR :</p>
                            <div className="border-b border-black w-64 mb-2"></div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 border-t pt-4">
                        <div className="flex justify-between">
                          <p>Document généré le {formatCurrentDate()}</p>
                          <p className="text-center font-semibold">Propriété NAFTAL GPL - Reproduction Interdite</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Print view - All districts */}
                <div className="hidden print:block">
                  {districts.map(([districtCode, district], districtIndex) => {
                    // Get all immobilisations for this district
                    let allDistrictImmobilisations: ImmobilisationHistorique[] = []
                    Object.values(district.centres).forEach((centre) => {
                      allDistrictImmobilisations = [...allDistrictImmobilisations, ...centre.immobilisations]
                    })

                    return (
                      <div key={districtCode} className="district-container">
                        {/* Report header */}
                        <div className="report-header border border-gray-800 mb-4 grid grid-cols-3">
                          <div className="border border-gray-800 p-4 flex items-center justify-center">
                            <div className="text-center">
                              <img src="/logo-naftal.png" alt="NAFTAL Logo" className="h-12 mx-auto mb-1" />
                              <div className="font-semibold text-xs">DIRECTION GENERALE</div>
                            </div>
                          </div>
                          <div className="border border-gray-800 p-4 flex items-center justify-center">
                            <h2 className="text-xl font-bold text-center">
                              SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE
                            </h2>
                          </div>
                          <div className="border border-gray-800 p-4">
                            <div className="font-semibold border-b border-black pb-1 mb-1 text-right">
                              EQ BGPL MT 33 v1
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Date d&apos;application : {formatCurrentDate()}</div>
                              <div className="mt-1">
                                Page : {districtIndex + 1} sur {totalDistricts}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between mb-4">
                          <p>
                            <span className="font-semibold">DISTRICT:</span> {district.designation}
                          </p>
                          <p>
                            <span className="font-semibold">PERIODE:</span>{" "}
                            {dateRange
                              ? `${dateRange.start} au ${dateRange.end}`
                              : selectedWeek && selectedMonth && selectedYear
                                ? `Semaine ${selectedWeek} - ${getMonthName(selectedMonth)} ${selectedYear}`
                                : "Non définie"}
                          </p>
                        </div>

                        {/* Table for this district */}
                        <div className="space-y-6">
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 border text-left font-semibold">CDS</th>
                                  <th className="px-4 py-2 border text-left font-semibold">VEHICULE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">DATE</th>
                                  <th className="px-4 py-2 border text-left font-semibold">LIEU</th>
                                  <th className="px-4 py-2 border text-left font-semibold">CAUSE_IMMOBILISATION</th>
                                  <th className="px-4 py-2 border text-left font-semibold">ACTIONS ENGAGEES</th>
                                  <th className="px-4 py-2 border text-left font-semibold">ECHEANCE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allDistrictImmobilisations.map((item, index) => (
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

                        {/* Signature section */}
                        <div className="mt-8">
                          <div className="flex justify-between items-end">
                            <div className="text-left">
                              <p className="font-semibold mb-8">VERIFIE PAR :</p>
                              <div className="border-b border-black w-64 mb-2"></div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold mb-8">APPROUVE PAR :</p>
                              <div className="border-b border-black w-64 mb-2"></div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 border-t pt-4">
                          <div className="flex justify-between">
                            <p>Document généré le {formatCurrentDate()}</p>
                            <p className="text-center font-semibold">Propriété NAFTAL GPL - Reproduction Interdite</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
