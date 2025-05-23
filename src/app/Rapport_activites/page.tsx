"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DateSelectionPopup from "./components/date-selection-popup"
import ActivityReport from "./components/activity-report"
import { Loader2, Search, Calendar, X } from "lucide-react"

export default function RapportActivitePage() {
  const [showDatePopup, setShowDatePopup] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<any[] | null>(null)
  const [manualMonth, setManualMonth] = useState("")
  const [manualYear, setManualYear] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (selectedDate) {
      fetchReportData(selectedDate)
    }
  }, [selectedDate])

  // Filter data when search term changes
  useEffect(() => {
    if (!reportData) return

    if (!searchTerm.trim()) {
      setFilteredData(reportData)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = reportData.filter(
      (item) =>
        item.code_vehicule.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        item.nom_district.toLowerCase().includes(term) ||
        item.designation.toLowerCase().includes(term) ||
        item.nature_travaux.toLowerCase().includes(term) ||
        (item.PDR_consommee && item.PDR_consommee.toLowerCase().includes(term)) ||
        (item.reference_bc_bm_btm && item.reference_bc_bm_btm.toLowerCase().includes(term)) ||
        (item.duree_travaux && item.duree_travaux.toLowerCase().includes(term)),
    )
    setFilteredData(filtered)
  }, [searchTerm, reportData])

  const fetchReportData = async (date: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Assuming user ID is 1 for now - in a real app, you'd get this from authentication
      const userId = 2

      const response = await fetch("/api/rapport/rapportActivites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_utilisateur: userId, date }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données du rapport")
      }

      const data = await response.json()
      setReportData(data.rapport_activite || [])
      setFilteredData(data.rapport_activite || [])
    } catch (err) {
      console.error("Error fetching report data:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelection = (year: string, month: string) => {
    // Format as MM/YYYY
    const formattedDate = `${month}/${year}`
    setSelectedDate(formattedDate)
    setManualMonth(month)
    setManualYear(year)
    setShowDatePopup(false)
  }

  const handleManualDateSubmit = () => {
    if (!manualMonth || !manualYear) return

    // Format as MM/YYYY
    const formattedDate = `${manualMonth}/${manualYear}`
    setSelectedDate(formattedDate)
    fetchReportData(formattedDate)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setFilteredData(reportData)
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {showDatePopup && <DateSelectionPopup onSelect={handleDateSelection} onCancel={() => router.back()} />}

      {!showDatePopup && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {selectedDate && (
                <div className="text-xl font-semibold text-gray-800">
                  Rapport d'activité - {getMonthName(selectedDate.split("/")[0])} {selectedDate.split("/")[1]}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Enhanced Search Input */}
                <div className="relative flex-grow md:max-w-xs">
                  <input
                    type="text"
                    placeholder="Rechercher par code, description, district..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  {searchTerm && (
                    <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Manual Date Selection */}
                <div className="flex gap-2 items-center">
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

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors print:hidden"
              >
                Imprimer
              </button>
            </div>

            {filteredData && reportData && (
              <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                <div>
                  {filteredData.length} résultat(s) {searchTerm && `pour "${searchTerm}"`} sur {reportData.length} total
                </div>
                {searchTerm && filteredData.length === 0 && (
                  <button onClick={clearSearch} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Effacer la recherche
                  </button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="ml-2 text-gray-600">Chargement des données...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => selectedDate && fetchReportData(selectedDate)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredData && filteredData.length > 0 ? (
            <ActivityReport data={filteredData} selectedDate={selectedDate} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Aucune donnée disponible pour cette période.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
