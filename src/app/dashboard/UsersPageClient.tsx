"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangleIcon, CarIcon, ClockIcon, LoaderIcon, RefreshCwIcon } from "lucide-react"

type VehiculeAlerte = {
  code_vehicule: string
  n_immatriculation: string
  marque_designation: string
  type_designation: string
  derniere_mise_a_jour: string
  jours_depuis_maj: number
}

type Props = {
  userId: number;
};

export default function UsersPage({ userId }: Props) {
  const [username, setUsername] = useState("");
  useEffect(() => {
    console.log("User ID:", userId); 
  }, [userId]);
  const router = useRouter()
  const [vehiculesAlertes, setVehiculesAlertes] = useState<VehiculeAlerte[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehiculesAlertes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch all vehicles first
      const res = await fetch("/api/vehicule/getVehicules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: 1 }), // Assuming user ID 1 for now
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des véhicules")
      }

      const vehicules = await res.json()

      // Check each vehicle for last kilometrage update
      const alertes: VehiculeAlerte[] = []

      for (const vehicule of vehicules) {
        try {
          const response = await fetch("/api/vehicule/kilometrage-heure/GetDerniereDate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code_vehicule: vehicule.code_vehicule }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data && data.date) {
              const lastUpdateDate = new Date(data.date)
              const currentDate = new Date()
              const diffTime = Math.abs(currentDate.getTime() - lastUpdateDate.getTime())
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              if (diffDays > 3) {
                alertes.push({
                  code_vehicule: vehicule.code_vehicule,
                  n_immatriculation: vehicule.n_immatriculation || "-",
                  marque_designation: vehicule.marque_designation,
                  type_designation: vehicule.type_designation,
                  derniere_mise_a_jour: data.date,
                  jours_depuis_maj: diffDays,
                })
              }
            }
          }
        } catch (err) {
          console.error(`Error checking vehicle ${vehicule.code_vehicule}:`, err)
        }
      }

      setVehiculesAlertes(alertes)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehiculesAlertes()
  }, [])

  const handleUpdateKilometrage = (code_vehicule: string) => {
    router.push(`/vehicule?update=${code_vehicule}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord des alertes</h1>
        <button
          onClick={fetchVehiculesAlertes}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <CarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules nécessitant une mise à jour</p>
              <p className="text-2xl font-semibold text-gray-900">{vehiculesAlertes.length}</p>
            </div>
          </div>
        </div>

        {/* Additional dashboard cards can be added here */}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Véhicules nécessitant une mise à jour de kilométrage / heures
          </h2>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <LoaderIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium text-gray-500">Chargement des alertes...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-500">Erreur lors du chargement des alertes</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button
                onClick={fetchVehiculesAlertes}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        ) : vehiculesAlertes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">Aucune alerte</p>
            <p className="text-sm text-gray-500 mt-1">
              Tous les véhicules ont été mis à jour dans les 3 derniers jours.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Marque / Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dernière mise à jour
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Jours écoulés
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehiculesAlertes.map((vehicule) => (
                  <tr key={vehicule.code_vehicule} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicule.code_vehicule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicule.n_immatriculation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicule.marque_designation} / {vehicule.type_designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicule.derniere_mise_a_jour).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicule.jours_depuis_maj > 7
                            ? "bg-red-100 text-red-800"
                            : vehicule.jours_depuis_maj > 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicule.jours_depuis_maj} jours
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleUpdateKilometrage(vehicule.code_vehicule)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ClockIcon className="h-3.5 w-3.5 mr-1" />
                        Mettre à jour
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
