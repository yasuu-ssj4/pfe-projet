"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, Printer, FileDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Helper function to get current user ID (placeholder)
const getCurrentUserId = () => {
  // In a real app, this would come from your auth system
  return 2 // Replace with actual user ID retrieval
}

type ImmobilisationRecord = {
  code_vehicule: string
  n_immatriculation: string
  date_immobilisation: string
  lieu: string
  cause_immobilisation: string
  action: string
  echeance: string | null
  type_designation: string
  marque_designation: string
}

export default function ImmobilisationConsultationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [immobilisations, setImmobilisations] = useState<Record<string, ImmobilisationRecord[]>>({})
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    const fetchImmobilisations = async () => {
      try {
        setLoading(true)
        console.log("hello world");
        
        const userId = getCurrentUserId()
        const response = await fetch("/api/immobilisation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch immobilisations")
        }

        const data = await response.json()
        console.log("Fetched immobilisations:", data);
        
        setImmobilisations(data.immobilisations)
        setCurrentDate(format(new Date(), "dd/MM/yyyy", { locale: fr }))
      } catch (error) {
        console.error("Error fetching immobilisations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImmobilisations()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Placeholder for export functionality
    alert("Export functionality will be implemented here")
  }

  // Filter immobilisations based on search term
  const filteredImmobilisations = Object.entries(immobilisations).reduce<Record<string, ImmobilisationRecord[]>>(
    (acc, [structure, vehicles]) => {
      const filteredVehicles = vehicles.filter(
        (vehicle) =>
          vehicle.code_vehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.n_immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.lieu && vehicle.lieu.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (vehicle.cause_immobilisation &&
            vehicle.cause_immobilisation.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (vehicle.action && vehicle.action.toLowerCase().includes(searchTerm.toLowerCase())),
      )

      if (filteredVehicles.length > 0) {
        acc[structure] = filteredVehicles
      }

      return acc
    },
    {},
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Not printed */}
      <div className="bg-[#0a2d5e] text-white p-4 print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents/immobilisation")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">CONSULTATION SITUATION D&apos;IMMOBILISATION</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrint} className="flex items-center bg-green-600 text-white px-3 py-2 rounded">
                <Printer className="mr-2 h-5 w-5" />
                Imprimer
              </button>
              <button onClick={handleExport} className="flex items-center bg-blue-600 text-white px-3 py-2 rounded">
                <FileDown className="mr-2 h-5 w-5" />
                Exporter
              </button>
            </div>
            <div className="flex items-center bg-white rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Rechercher..."
                className="px-3 py-2 text-black outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-yellow-500 p-2">
                <Search className="h-5 w-5 text-[#0a2d5e]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center">
            <div className="mr-4">
       
            </div>
            <div>
              <h1 className="text-xl font-bold">BRANCHE GPL</h1>
            </div>
          </div>
          <div className="text-right">
            <h2 className="font-bold">EQ BGPL MT 33 v1</h2>
            <p>Date d&apos;application : {currentDate}</p>
            <p>Page 1 sur 1</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto my-6 print:my-0">
        <div className="print:text-center print:mb-6">
          <h1 className="text-2xl font-bold hidden print:block print:text-center">
            SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE
          </h1>
          <div className="print:flex print:justify-between print:mt-4 hidden print:block">
            <p>
              <span className="font-semibold">DISTRICT:</span> ___________________
            </p>
            <p>
              <span className="font-semibold">ARRETEE AU:</span> {currentDate}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a2d5e]"></div>
          </div>
        ) : Object.keys(filteredImmobilisations).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune immobilisation trouvée</p>
          </div>
        ) : (
          Object.entries(filteredImmobilisations).map(([structure, vehicles]) => (
            <div key={structure} className="mb-8">
              <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">{structure}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border text-left font-semibold">CDS</th>
                      <th className="px-4 py-2 border text-left font-semibold">DATE</th>
                      <th className="px-4 py-2 border text-left font-semibold">LIEU</th>
                      <th className="px-4 py-2 border text-left font-semibold">CAUSES D&apos;IMMOBILISATION</th>
                      <th className="px-4 py-2 border text-left font-semibold">ACTIONS ENGAGEES</th>
                      <th className="px-4 py-2 border text-left font-semibold">ECHEANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{vehicle.code_vehicule}</td>
                        <td className="px-4 py-2 border">
                          {vehicle.date_immobilisation
                            ? new Date(vehicle.date_immobilisation).toLocaleDateString("fr-FR")
                            : ""}
                        </td>
                        <td className="px-4 py-2 border">{vehicle.lieu || ""}</td>
                        <td className="px-4 py-2 border">{vehicle.cause_immobilisation || ""}</td>
                        <td className="px-4 py-2 border">{vehicle.action || ""}</td>
                        <td className="px-4 py-2 border">
                          {vehicle.echeance ? new Date(vehicle.echeance).toLocaleDateString("fr-FR") : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Print footer */}
      <div className="hidden print:block print:mt-8 print:border-t print:pt-4">
        <div className="flex justify-between">
          <p>Document généré le {new Date().toLocaleDateString("fr-FR")}</p>
          <p>Système de Gestion de Maintenance</p>
        </div>
      </div>
    </div>
  )
}
