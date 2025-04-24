"use client"

import { useSearchParams, useRouter } from "next/navigation"
import FormRapport from "./rapport"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function RapportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id_demande_intervention = searchParams.get("id_demande_intervention")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id_demande_intervention) {
      router.push("/vehicule")
      return
    }

    // Verify that the demande exists and has the correct status
    const verifyDemande = async () => {
      try {
        const res = await fetch("/api/intervention/getDemandeById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_demande_intervention }),
        })

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération de la demande")
        }

        const demande = await res.json()

        // Check if the demande has the correct status
        if (demande.etat_demande !== "rapport") {
          setError("Cette demande n'est pas en état 'rapport' et ne peut pas recevoir de rapport d'intervention.")
        }
      } catch (err) {
        console.error("Erreur:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading(false)
      }
    }

    verifyDemande()
  }, [id_demande_intervention, router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => router.push("/vehicule")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retour aux véhicules
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#dcdfe8] min-h-screen">
      <div className="flex flex-1 pt-[12vh] h-lvh">
        <main className="w-full h-full flex-1">
          <div className="flex justify-end">
            <FormRapport id_demande_intervention={id_demande_intervention!} />
          </div>
        </main>
      </div>
    </div>
  )
}
