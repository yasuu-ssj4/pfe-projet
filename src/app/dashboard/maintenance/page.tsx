"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import MaintenanceAlertsTable from "@/app/components/maintenance-alerts-table"

// Helper function to get current user ID (placeholder)
const getCurrentUserId = () => {
  // In a real app, this would come from your auth system
  return 2 // Replace with actual user ID retrieval
}

export default function MaintenancePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<number>(0)

  useEffect(() => {
    // Get the user ID
    const id = getCurrentUserId()
    setUserId(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0a2d5e] text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour au tableau de bord
            </button>
            <h1 className="text-2xl font-bold text-center">Alertes de Maintenance</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Alertes de maintenance basées sur le kilométrage</h2>
          <p className="text-gray-600">
            Ce tableau affiche les alertes de maintenance basées sur le kilométrage accumulé depuis la dernière
            réinitialisation. Cliquez sur le bouton X pour réinitialiser le compteur après avoir effectué la
            maintenance.
          </p>
        </div>

        {userId > 0 && <MaintenanceAlertsTable userId={userId} />}
      </div>
    </div>
  )
}
