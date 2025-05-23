"use client"

import { useEffect, useState } from "react"
import { X, Check, AlertTriangle } from "lucide-react"

type MaintenanceAlert = {
  id?: number
  code_vehicule: string
  code_type: number
  code_gamme: string
  code_operation: string
  gamme_designation: string
  operation_designation: string
  periode: number
  valeur_accumulee: number
  valeur_restante: number
  unite_mesure: string
  statut?: string
}

type MaintenanceGammesSelectorProps = {
  visible: boolean
  onClose: () => void
  code_vehicule: string
  onSelect: (selectedGammes: MaintenanceAlert[]) => void
}

const MaintenanceGammesSelector = ({ visible, onClose, code_vehicule, onSelect }: MaintenanceGammesSelectorProps) => {
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGammes, setSelectedGammes] = useState<MaintenanceAlert[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (visible && code_vehicule) {
      fetchMaintenanceAlerts()
    }
  }, [visible, code_vehicule])

  const fetchMaintenanceAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/alerts/maintenance_demande`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: 2, code_vehicule: code_vehicule }),
      })
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des alertes de maintenance")
      }
      const allAlerts = await response.json()

      // Filter alerts for the selected vehicle
      const vehicleAlerts = allAlerts.filter((alert: MaintenanceAlert) => alert.code_vehicule === code_vehicule)

      // Process alerts to add ID
      const processedAlerts = vehicleAlerts.map((alert: MaintenanceAlert, index: number) => {
        return {
          ...alert,
          id: index + 1,
        }
      })

      setMaintenanceAlerts(processedAlerts)
    } catch (err) {
      console.error("Error fetching maintenance alerts:", err)
      setError("Impossible de charger les alertes de maintenance")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelect = (alert: MaintenanceAlert) => {
    setSelectedGammes((prev) => {
      const isSelected = prev.some((item) => item.id === alert.id)
      if (isSelected) {
        return prev.filter((item) => item.id !== alert.id)
      } else {
        return [...prev, alert]
      }
    })
  }

  const handleConfirm = () => {
    onSelect(selectedGammes)
    onClose()
  }

  const filteredAlerts = maintenanceAlerts.filter(
    (alert) =>
      alert.gamme_designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.operation_designation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
      <div className="bg-white w-full max-w-5xl shadow-xl rounded-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Sélectionner les opérations de maintenance</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Rechercher une opération..."
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-gray-600">
                Sélectionnez les opérations de maintenance à inclure dans la demande d&apos;intervention.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2">Chargement des opérations de maintenance...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Aucune opération de maintenance trouvée pour ce véhicule.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Sélection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gamme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opération
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Périodicité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedGammes.some((item) => item.id === alert.id) ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleToggleSelect(alert)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div
                          className={`h-5 w-5 border rounded flex items-center justify-center ${
                            selectedGammes.some((item) => item.id === alert.id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedGammes.some((item) => item.id === alert.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.gamme_designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.operation_designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {alert.periode} {alert.unite_mesure === "kilometrage" ? "km" : "jours"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Reste: {alert.valeur_restante.toLocaleString()}{" "}
                        {alert.unite_mesure === "kilometrage" ? "km" : "jours"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">{selectedGammes.length} opération(s) sélectionnée(s)</div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedGammes.length === 0}
              className={`px-4 py-2 rounded-md transition duration-300 font-medium ${
                selectedGammes.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Confirmer la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceGammesSelector
