"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Status {
  code_status: string
  designation: string
  couleur?: string
}

interface StatusUpdatePopupProps {
  isOpen: boolean
  onClose: () => void
  code_vehicule: string
  onUpdate: (data: { code_vehicule: string; code_status: string }) => Promise<void>
}

export default function StatusUpdatePopup({ isOpen, onClose, code_vehicule, onUpdate }: StatusUpdatePopupProps) {
  const [code_status, setCodeStatus] = useState<string>("")
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchStatuses = async () => {
      setIsLoadingStatuses(true)
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/vehicule/status/affecterStatus", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statuts")
        }
        const data = await response.json()
        console.log("Fetched statuses:", data);
        
        setStatuses(data)
      } catch (err) {
        console.error("Error fetching statuses:", err)
        setError("Impossible de charger la liste des statuts")
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    if (isOpen) {
      fetchStatuses()
      setCodeStatus("")
      setSuccess(false)
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate input
      if (!code_status) {
        throw new Error("Veuillez sélectionner un statut")
      }

      // Call the update function passed as prop
      await onUpdate({ code_vehicule, code_status })

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Changer le statut</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Statut mis à jour avec succès</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="code_vehicule" className="block text-sm font-medium text-gray-700 mb-1">
                Code véhicule
              </label>
              <input
                type="text"
                id="code_vehicule"
                value={code_vehicule}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="code_status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              {isLoadingStatuses ? (
                <div className="flex items-center justify-center py-4">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((status) => (
                    <div key={status.code_status} className="relative">
                      <input
                        type="radio"
                        id={`status-${status.code_status}`}
                        name="code_status"
                        value={status.code_status}
                        checked={code_status === status.code_status}
                        onChange={() => setCodeStatus(status.code_status)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`status-${status.code_status}`}
                        className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
                          code_status === status.code_status
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{
                            backgroundColor:
                              status.code_status === "IMB"
                                ? "#ef4444" // Red for IMB
                                : status.code_status === "OPR"
                                  ? "#22c55e" // Green for OPR
                                  : status.code_status === "LQD"
                                    ? "#38bdf8" // Light blue for LQD
                                    : status.code_status === "PRF"
                                      ? "#e8561c" 
                                      : status.code_status === "IRF"
                                        ? "#6b7280" // Purple for RES
                                        : status.code_status === "RFD"
                                          ? "#718096" // Gray for DIS
                                    : status.couleur || "#718096", // Default to gray or use the color from API
                          }}
                        ></span>
                        <span className="text-sm font-medium text-gray-900">{status.designation}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading || isLoadingStatuses}
              >
                {isLoading ? "Mise à jour..." : "Confirmer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
