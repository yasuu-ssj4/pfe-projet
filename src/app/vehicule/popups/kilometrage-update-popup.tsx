// "use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface KilometrageUpdatePopupProps {
  isOpen: boolean
  onClose: () => void
  code_vehicule: string
  isHoursMeter?: boolean
  onUpdate: (params: {
    code_vehicule: string
    kilo_parcouru_heure_fonctionnement: number
  }) => Promise<void>
}

export default function KilometrageUpdatePopup({
  isOpen,
  onClose,
  code_vehicule,
  isHoursMeter = false,
  onUpdate,
}: KilometrageUpdatePopupProps) {
  const [kilo_parcouru_heure_fonctionnement, setKiloParcouru] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate input
      if (kilo_parcouru_heure_fonctionnement <= 0) {
        throw new Error("Le kilométrage / heures doit être supérieur à 0")
      }

      // Call the update function passed as prop with current date
      await onUpdate({
        code_vehicule,
        kilo_parcouru_heure_fonctionnement,
      })

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
          <h2 className="text-xl font-semibold text-gray-800">Mettre à jour le kilométrage / heures</h2>
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
                  <p className="text-sm font-medium text-green-800">Kilométrage / Heures mis à jour avec succès</p>
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="text"
                id="date"
                value={new Date().toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
              <p className="mt-1 text-xs text-gray-500">La date actuelle sera utilisée automatiquement</p>
            </div>

            <div>
              <label
                htmlFor="kilo_parcouru_heure_fonctionnement"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kilométrage / Heures
              </label>
              <input
                type="number"
                id="kilo_parcouru_heure_fonctionnement"
                value={kilo_parcouru_heure_fonctionnement || ""}
                onChange={(e) => setKiloParcouru(Number(e.target.value))}
                min="0"
                step={isHoursMeter ? "0.1" : "1"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le kilométrage ou les heures"
                required
              />
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
                disabled={isLoading}
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
