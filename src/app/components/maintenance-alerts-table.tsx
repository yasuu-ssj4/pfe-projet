"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"

type MaintenanceAlert = {
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
}

export default function MaintenanceAlertsTable({ userId }: { userId: number }) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resetting, setResetting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/alerts/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch maintenance alerts")
      }

      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error("Error fetching maintenance alerts:", error)
      setError("Erreur lors du chargement des alertes de maintenance")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (alert: MaintenanceAlert) => {
    try {
      const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
      setResetting({ ...resetting, [key]: true })

      const response = await fetch("/api/alerts/maintenance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_vehicule: alert.code_vehicule,
          code_type: alert.code_type,
          code_gamme: alert.code_gamme,
          code_operation: alert.code_operation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset maintenance counter")
      }

      // Remove this alert from the list
      setAlerts(
        alerts.filter(
          (a) =>
            !(
              a.code_vehicule === alert.code_vehicule &&
              a.code_type === alert.code_type &&
              a.code_gamme === alert.code_gamme &&
              a.code_operation === alert.code_operation
            ),
        ),
      )
    } catch (error) {
      console.error("Error resetting maintenance counter:", error)
  
    } finally {
      const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
      setResetting({ ...resetting, [key]: false })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="ml-2 text-gray-600">Chargement des alertes de maintenance...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={fetchAlerts}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">Aucune alerte de maintenance</p>
        <p className="text-sm text-gray-500 mt-1">Tous les véhicules sont à jour avec leur programme de maintenance.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Alertes de maintenance basées sur le kilométrage</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gamme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opération
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur accumulée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur restante
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.map((alert, index) => {
              const key = `${alert.code_vehicule}-${alert.code_type}-${alert.code_gamme}-${alert.code_operation}`
              const isResetting = resetting[key] || false

              return (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.code_vehicule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.gamme_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.operation_designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.valeur_accumulee.toLocaleString()} {alert.unite_mesure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.periode.toLocaleString()} {alert.unite_mesure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.valeur_restante <= 0
                          ? "bg-red-100 text-red-800"
                          : alert.valeur_restante <= alert.periode * 0.1
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.valeur_restante <= 0
                        ? "Dépassé"
                        : `${alert.valeur_restante.toLocaleString()} ${alert.unite_mesure}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleReset(alert)}
                      disabled={isResetting}
                      className="text-red-600 hover:text-red-900 focus:outline-none disabled:opacity-50"
                      title="Réinitialiser le compteur"
                    >
                      {isResetting ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
