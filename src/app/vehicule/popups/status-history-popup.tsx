"use client"

import { useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight, Calendar, Clock, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Couleurs des statuts
const STATUS_COLORS = {
  IMB: "#FF5252", // Rouge - Immobilisé
  IRF: "#FFC107", // Ambre - Intention à la réforme
  LQD: "#9E9E9E", // Gris - Liquidé
  OPR: "#4CAF50", // Vert - Opérationnel
  PRF: "#FF9800", // Orange - Proposé à la réforme
  RFD: "#607D8B", // Bleu Gris - Réformé définitivement
}

const STATUS_LABELS = {
  IMB: "Immobilisé",
  IRF: "Intention à la réforme",
  LQD: "Liquidé",
  OPR: "Opérationnel",
  PRF: "Proposé à la réforme",
  RFD: "Réformé définitivement",
}

// Icône de statut pour la timeline
type StatusIconProps = {
  status: keyof typeof STATUS_COLORS;
  isActive: boolean;
  onClick: () => void;
};

const StatusIcon = ({ status, isActive, onClick }: StatusIconProps) => {
  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ease-out ${isActive ? "scale-125 z-10" : "hover:scale-110"}`}
      onClick={onClick}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${isActive ? "ring-4 ring-offset-2 ring-opacity-50" : ""}`}
        style={{
          backgroundColor: STATUS_COLORS[status],
          boxShadow: isActive ? `0 0 20px ${STATUS_COLORS[status]}` : "",
        }}
      >
        <span className="text-white font-bold text-sm">{status}</span>
      </div>
    </div>
  )
}

// Composant d'analyse des statuts
const StatusAnalytics = ({ statusHistory }) => {
  // Calculer le temps passé dans chaque statut
  const calculateTimeInStatus = () => {
    const result = {}

    for (let i = 0; i < statusHistory.length; i++) {
      const current = statusHistory[i]
      const next = statusHistory[i + 1]

      const startDate = new Date(current.date)
      const endDate = next ? new Date(next.date) : new Date()

      const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))

      if (!result[current.code_status]) {
        result[current.code_status] = 0
      }

      result[current.code_status] += days
    }

    return result
  }

  const timeInStatus = calculateTimeInStatus()
  const totalDays = Object.values(timeInStatus).reduce((sum, days) => sum + days, 0)

  return (
    <div className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Analyse de statut</h3>
      <div className="space-y-3">
        {Object.entries(timeInStatus).map(([status, days]) => (
          <div key={status} className="relative">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
              <span className="text-sm font-medium">
                {days} jours ({Math.round((days / totalDays) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${(days / totalDays) * 100}%`,
                  backgroundColor: STATUS_COLORS[status],
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant principal du popup
export default function StatusHistoryPopup({ isOpen, onClose, code_vehicule }) {
  const [statusHistory, setStatusHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [vehicleInfo, setVehicleInfo] = useState(null)
  const [view, setView] = useState("timeline") // 'timeline' ou 'analytics'

  useEffect(() => {
    if (isOpen && code_vehicule) {
      fetchStatusHistory()
      fetchVehicleInfo()
    }
  }, [isOpen, code_vehicule])

  const fetchStatusHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/vehicule/status/getHistorique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique des statuts")
      }

      const data = await response.json()

      // Trier par date (plus ancien en premier)
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date))

      setStatusHistory(sortedData)
      setActiveIndex(sortedData.length - 1) // Définir actif sur le plus récent
    } catch (err) {
      console.error("Error fetching status history:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVehicleInfo = async () => {
    try {
      const response = await fetch("/api/vehicule/getVehiculeInfos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_vehicule }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des informations du véhicule")
      }

      const data = await response.json()
      setVehicleInfo(data[0])
    } catch (err) {
      console.error("Error fetching vehicle info:", err)
    }
  }

  const handlePrevious = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(statusHistory.length - 1, prev + 1))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200"
        >
          {/* En-tête */}
          <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Historique des Statuts
                {vehicleInfo && (
                  <span className="ml-2 text-gray-500">
                    | {vehicleInfo.n_immatriculation} - {vehicleInfo.marque_designation} {vehicleInfo.type_designation}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView("timeline")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === "timeline" ? "bg-blue-600 text-white" : "text-gray-700 hover:text-gray-900"}`}
                >
                  Chronologie
                </button>
                <button
                  onClick={() => setView("analytics")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === "analytics" ? "bg-blue-600 text-white" : "text-gray-700 hover:text-gray-900"}`}
                >
                  Analytique
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="h-full pt-16 pb-20">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <p className="text-xl font-semibold mb-2">Erreur</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : statusHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-xl font-semibold mb-2">Aucun historique disponible</p>
                  <p>Ce véhicule n'a pas d'historique de statut enregistré.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col md:flex-row">
                {/* Zone de visualisation principale */}
                <div className="flex-1 h-full relative">
                  {view === "timeline" && (
                    <div className="h-full overflow-y-auto p-6">
                      <div className="relative">
                        {/* Ligne verticale */}
                        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>

                        {/* Éléments de la chronologie */}
                        {statusHistory.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative pl-16 py-6 cursor-pointer ${index === activeIndex ? "z-10" : ""}`}
                            onClick={() => setActiveIndex(index)}
                          >
                            {/* Icône de statut */}
                            <div className="absolute left-0 flex items-center justify-center">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${index === activeIndex ? "ring-4 ring-gray-200" : ""}`}
                                style={{
                                  backgroundColor: STATUS_COLORS[item.code_status],
                                  boxShadow: index === activeIndex ? `0 0 20px ${STATUS_COLORS[item.code_status]}` : "",
                                }}
                              >
                                <span className="text-white font-bold">{item.code_status}</span>
                              </div>
                            </div>

                            {/* Contenu */}
                            <div
                              className={`bg-white rounded-xl p-4 shadow-sm transition-all duration-300 ${
                                index === activeIndex
                                  ? "border-l-4 transform scale-105 shadow-md"
                                  : "border-l-4 border-transparent border"
                              }`}
                              style={{
                                borderLeftColor:
                                  index === activeIndex ? STATUS_COLORS[item.code_status] : "transparent",
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-800">{STATUS_LABELS[item.code_status]}</h3>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Calendar size={14} className="mr-1" />
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              </div>

                              {index === activeIndex && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-3 pt-3 border-t border-gray-200"
                                >
                                  <div className="text-gray-700">
                                    {index < statusHistory.length - 1 && (
                                      <div className="mb-2">
                                        <span className="text-gray-500">Durée dans ce statut: </span>
                                        {Math.round(
                                          (new Date(statusHistory[index + 1].date) - new Date(item.date)) /
                                            (1000 * 60 * 60 * 24),
                                        )}{" "}
                                        jours
                                      </div>
                                    )}

                                    {index === statusHistory.length - 1 && (
                                      <div className="mb-2">
                                        <span className="text-gray-500">Statut actuel depuis: </span>
                                        {Math.round((new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24))} jours
                                      </div>
                                    )}

                                    <div className="flex items-center text-sm">
                                      <Info size={14} className="mr-1 text-gray-500" />
                                      {getStatusDescription(item.code_status)}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === "analytics" && (
                    <div className="h-full overflow-y-auto p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Graphique de distribution des statuts */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des statuts</h3>
                          <div className="aspect-square relative">
                            <StatusDistributionChart statusHistory={statusHistory} />
                          </div>
                        </div>

                        {/* Analyse des statuts */}
                        <div>
                          <StatusAnalytics statusHistory={statusHistory} />

                          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Insights</h3>
                            <ul className="space-y-2 text-gray-700">
                              {generateInsights(statusHistory).map((insight, index) => (
                                <li key={index} className="flex">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panneau de détails (uniquement en vue chronologie) */}
                {view === "timeline" && (
                  <div className="w-full md:w-80 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto">
                    {statusHistory[activeIndex] && (
                      <div className="p-6">
                        <div
                          className="w-full h-20 rounded-lg mb-4 flex items-center justify-center"
                          style={{ backgroundColor: STATUS_COLORS[statusHistory[activeIndex].code_status] }}
                        >
                          <h3 className="text-2xl font-bold text-white">
                            {STATUS_LABELS[statusHistory[activeIndex].code_status]}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-gray-500 text-sm mb-1">Code</div>
                            <div className="text-gray-800 font-medium">{statusHistory[activeIndex].code_status}</div>
                          </div>

                          <div>
                            <div className="text-gray-500 text-sm mb-1">Date</div>
                            <div className="text-gray-800 font-medium flex items-center">
                              <Calendar size={16} className="mr-2" />
                              {new Date(statusHistory[activeIndex].date).toLocaleDateString()}
                            </div>
                          </div>

                          {activeIndex < statusHistory.length - 1 && (
                            <div>
                              <div className="text-gray-500 text-sm mb-1">Durée dans ce statut</div>
                              <div className="text-gray-800 font-medium flex items-center">
                                <Clock size={16} className="mr-2" />
                                {Math.round(
                                  (new Date(statusHistory[activeIndex + 1].date) -
                                    new Date(statusHistory[activeIndex].date)) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                jours
                              </div>
                            </div>
                          )}

                          {activeIndex === statusHistory.length - 1 && (
                            <div>
                              <div className="text-gray-500 text-sm mb-1">Statut actuel depuis</div>
                              <div className="text-gray-800 font-medium flex items-center">
                                <Clock size={16} className="mr-2" />
                                {Math.round(
                                  (new Date() - new Date(statusHistory[activeIndex].date)) / (1000 * 60 * 60 * 24),
                                )}{" "}
                                jours
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-gray-500 text-sm mb-1">Description</div>
                            <div className="text-gray-800">
                              {getStatusDescription(statusHistory[activeIndex].code_status)}
                            </div>
                          </div>

                          {activeIndex > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="text-gray-500 text-sm mb-2">Transition</div>
                              <div className="flex items-center">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                                  style={{ backgroundColor: STATUS_COLORS[statusHistory[activeIndex - 1].code_status] }}
                                >
                                  {statusHistory[activeIndex - 1].code_status}
                                </div>
                                <div className="mx-2">
                                  <ChevronRight size={16} className="text-gray-500" />
                                </div>
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                                  style={{ backgroundColor: STATUS_COLORS[statusHistory[activeIndex].code_status] }}
                                >
                                  {statusHistory[activeIndex].code_status}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contrôles de navigation */}
          {!isLoading && statusHistory.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-10 px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={activeIndex === 0}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:bg-gray-200"
              >
                <ChevronLeft size={18} className="mr-1" />
                Précédent
              </button>

              <div className="flex items-center space-x-2">
                {statusHistory.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      index === activeIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={activeIndex === statusHistory.length - 1}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:bg-gray-200"
              >
                Suivant
                <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Fonctions utilitaires
function getStatusDescription(code) {
  const descriptions = {
    IMB: "Le véhicule est temporairement hors service en raison de problèmes techniques ou de maintenance.",
    IRF: "Le véhicule est identifié pour une possible réforme, mais aucune décision finale n'a été prise.",
    LQD: "Le véhicule a été retiré définitivement de la flotte et liquidé selon les procédures administratives.",
    OPR: "Le véhicule est en bon état de fonctionnement et disponible pour une utilisation normale.",
    PRF: "Une proposition formelle a été faite pour réformer le véhicule, en attente d'approbation.",
    RFD: "Le véhicule a été officiellement réformé et n'est plus considéré comme un actif opérationnel.",
  }

  return descriptions[code] || "Description non disponible"
}

// Composant de graphique de distribution des statuts
function StatusDistributionChart({ statusHistory }) {
  // Calculer le temps passé dans chaque statut
  const calculateTimeInStatus = () => {
    const result = {}

    for (let i = 0; i < statusHistory.length; i++) {
      const current = statusHistory[i]
      const next = statusHistory[i + 1]

      const startDate = new Date(current.date)
      const endDate = next ? new Date(next.date) : new Date()

      const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))

      if (!result[current.code_status]) {
        result[current.code_status] = 0
      }

      result[current.code_status] += days
    }

    return result
  }

  const timeInStatus = calculateTimeInStatus()
  const totalDays = Object.values(timeInStatus).reduce((sum, days) => sum + days, 0)

  // Calculer les segments pour le graphique circulaire
  const segments = Object.entries(timeInStatus).map(([status, days]) => ({
    status,
    percentage: (days / totalDays) * 100,
    color: STATUS_COLORS[status],
  }))

  // Trier les segments par pourcentage (le plus grand d'abord)
  segments.sort((a, b) => b.percentage - a.percentage)

  // Calculer les pourcentages cumulatifs pour le dessin
  let cumulativePercentage = 0
  const segmentsWithAngles = segments.map((segment) => {
    const startAngle = cumulativePercentage
    cumulativePercentage += segment.percentage
    const endAngle = cumulativePercentage

    return {
      ...segment,
      startAngle: (startAngle / 100) * 360,
      endAngle: (endAngle / 100) * 360,
    }
  })

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        {/* Graphique circulaire */}
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {segmentsWithAngles.map((segment, index) => {
            const startAngle = (segment.startAngle * Math.PI) / 180
            const endAngle = (segment.endAngle * Math.PI) / 180

            const x1 = 50 + 40 * Math.cos(startAngle)
            const y1 = 50 + 40 * Math.sin(startAngle)
            const x2 = 50 + 40 * Math.cos(endAngle)
            const y2 = 50 + 40 * Math.sin(endAngle)

            const largeArcFlag = segment.percentage > 50 ? 1 : 0

            const pathData = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

            return <path key={index} d={pathData} fill={segment.color} stroke="#ffffff" strokeWidth="1" />
          })}
        </svg>

        {/* Cercle central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800 text-xs text-center shadow-sm">
            {segments.length > 0 ? (
              <>
                <div>
                  <div className="font-bold text-lg">{Math.round(segments[0].percentage)}%</div>
                  <div className="text-xs text-gray-500">{STATUS_LABELS[segments[0].status]}</div>
                </div>
              </>
            ) : (
              <div>Aucune donnée</div>
            )}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="ml-4 space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: segment.color }}></div>
            <div className="text-xs text-gray-800">
              <span className="font-medium">{STATUS_LABELS[segment.status]}</span>
              <span className="text-gray-500 ml-1">({Math.round(segment.percentage)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Générer des insights basés sur l'historique des statuts
function generateInsights(statusHistory) {
  if (!statusHistory || statusHistory.length === 0) {
    return ["Aucune donnée disponible pour générer des insights."]
  }

  const insights = []

  // Calculer le temps dans chaque statut
  const timeInStatus = {}
  for (let i = 0; i < statusHistory.length; i++) {
    const current = statusHistory[i]
    const next = statusHistory[i + 1]

    const startDate = new Date(current.date)
    const endDate = next ? new Date(next.date) : new Date()

    const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))

    if (!timeInStatus[current.code_status]) {
      timeInStatus[current.code_status] = 0
    }

    timeInStatus[current.code_status] += days
  }

  // Statut actuel
  const currentStatus = statusHistory[statusHistory.length - 1]
  insights.push(
    `Le véhicule est actuellement en statut "${STATUS_LABELS[currentStatus.code_status]}" depuis ${Math.round((new Date() - new Date(currentStatus.date)) / (1000 * 60 * 60 * 24))} jours.`,
  )

  // Statut le plus courant
  const mostCommonStatus = Object.entries(timeInStatus).sort((a, b) => b[1] - a[1])[0]
  insights.push(
    `Le statut le plus fréquent est "${STATUS_LABELS[mostCommonStatus[0]]}" avec un total de ${mostCommonStatus[1]} jours.`,
  )

  // Temps opérationnel
  if (timeInStatus["OPR"]) {
    const totalDays = Object.values(timeInStatus).reduce((sum, days) => sum + days, 0)
    const operationalPercentage = Math.round((timeInStatus["OPR"] / totalDays) * 100)
    insights.push(`Le véhicule a été opérationnel pendant ${operationalPercentage}% de sa durée de vie.`)
  }

  // Fréquence des changements de statut
  const lifespan = Math.round((new Date() - new Date(statusHistory[0].date)) / (1000 * 60 * 60 * 24))
  const changesPerYear = (statusHistory.length / lifespan) * 365
  if (changesPerYear > 0) {
    insights.push(`En moyenne, le statut change ${changesPerYear.toFixed(1)} fois par an.`)
  }

  // Modèle récent
  if (statusHistory.length >= 3) {
    const recentStatuses = statusHistory.slice(-3).map((item) => item.code_status)
    if (recentStatuses.includes("IMB") && recentStatuses.includes("OPR")) {
      insights.push("Le véhicule a alterné entre les états opérationnel et immobilisé récemment.")
    }
  }

  return insights
}
