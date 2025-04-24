"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeftIcon } from "lucide-react"

export default function DemandeInterventionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code_vehicule = searchParams.get("code")

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter une demande d'intervention</h1>
          <p className="text-gray-600">Véhicule: {code_vehicule}</p>
        </div>
        <button
          onClick={() => router.push("/vehicule")}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <p className="text-center text-gray-500">Formulaire d'ajout de demande d'intervention à implémenter ici.</p>
      </div>
    </div>
  )
}
