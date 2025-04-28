"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, Save, Check } from "lucide-react"
import { useRouter } from "next/navigation"


const immobilisationData = [
  {
    cds: "C2214",
    code: "06/09/2019",
    date: "06/09/2019",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "C2231",
    code: "25/05/2024",
    date: "25/05/2024",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "F0080",
    code: "22/05/2023",
    date: "22/05/2023",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "F0108",
    code: "08/11/2023",
    date: "08/11/2023",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L3125",
    code: "13/12/2022",
    date: "13/12/2022",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L3141",
    code: "28/12/2021",
    date: "28/12/2021",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L3517",
    code: "25/05/2024",
    date: "25/05/2024",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L3538",
    code: "08/08/2023",
    date: "08/08/2023",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L3594",
    code: "06/06/2024",
    date: "06/06/2024",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "L4152",
    code: "08/06/2022",
    date: "08/06/2022",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "P0173",
    code: "04/04/2024",
    date: "04/04/2024",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
  {
    cds: "P0209",
    code: "15/05/2024",
    date: "15/05/2024",
    lieu: "",
    causes: "",
    actions: "",
    echeance: "",
  },
]

// Group vehicles by CDS
const groupByCds = (data: typeof immobilisationData) => {
  const grouped: Record<string, typeof immobilisationData> = {}

  data.forEach((item) => {
    if (!grouped[item.cds]) {
      grouped[item.cds] = []
    }
    grouped[item.cds].push(item)
  })

  return Object.values(grouped)
}

export default function ImmobilisationPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editableValues, setEditableValues] = useState<Record<string, string>>({})
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({})

  const itemsPerPage = 10
  const groupedData = groupByCds(immobilisationData)

  // Filter data based on search term
  const filteredData = searchTerm
    ? groupedData.filter((group) =>
        group.some((item) => Object.values(item).some((val) => val.toLowerCase().includes(searchTerm.toLowerCase()))),
      )
    : groupedData

  // Paginate data
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleInputChange = (cds: string, field: string, value: string) => {
    setEditableValues({
      ...editableValues,
      [`${cds}-${field}`]: value,
    })

    // When a field is edited, mark the row as unsaved
    setSavedRows({
      ...savedRows,
      [cds]: false,
    })
  }

  const getValue = (cds: string, field: string, defaultValue: string) => {
    const key = `${cds}-${field}`
    return editableValues[key] !== undefined ? editableValues[key] : defaultValue
  }

  const handleSaveRow = (cds: string) => {
    // In a real application, you would save to a database here
    console.log(`Saving data for CDS: ${cds}`, {
      lieu: getValue(cds, "lieu", ""),
      causes: getValue(cds, "causes", ""),
      actions: getValue(cds, "actions", ""),
      echeance: getValue(cds, "echeance", ""),
    })

    // Mark the row as saved
    setSavedRows({
      ...savedRows,
      [cds]: true,
    })

    // Show saved status for 2 seconds
    setTimeout(() => {
      setSavedRows({
        ...savedRows,
        [cds]: false,
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0a2d5e] text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/documents")}
              className="flex items-center text-yellow-400 hover:underline"
            >
              <ChevronLeft className="mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-center">SITUATION D&apos;IMMOBILISATION HEBDOMADAIRE</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p>
                <span className="font-semibold">DISTRICT:</span> DISTRICT GPL TLEMCEN
              </p>
              <p>
                <span className="font-semibold">ARRETEE AU:</span> 23/02/2025
              </p>
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

      {/* Table */}
      <div className="container mx-auto my-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 border text-left font-semibold">CDS</th>
              <th className="px-4 py-3 border text-left font-semibold">CODE</th>
              <th className="px-4 py-3 border text-left font-semibold">DATE</th>
              <th className="px-4 py-3 border text-left font-semibold">LIEU</th>
              <th className="px-4 py-3 border text-left font-semibold">CAUSES D&apos;IMMOBILISATION</th>
              <th className="px-4 py-3 border text-left font-semibold">ACTIONS ENGAGEES</th>
              <th className="px-4 py-3 border text-left font-semibold">ECHEANCE</th>
              <th className="px-4 py-3 border text-center font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((group, groupIndex) =>
              group.map((item, itemIndex) => (
                <tr key={`${groupIndex}-${itemIndex}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">{item.cds}</td>
                  <td className="px-4 py-3 border">{item.code}</td>
                  <td className="px-4 py-3 border">{item.date}</td>
                  <td className="px-4 py-3 border">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={getValue(item.cds, "lieu", "")}
                      onChange={(e) => handleInputChange(item.cds, "lieu", e.target.value)}
                      placeholder="Lieu"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={getValue(item.cds, "causes", "")}
                      onChange={(e) => handleInputChange(item.cds, "causes", e.target.value)}
                      placeholder="Causes d'immobilisation"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={getValue(item.cds, "actions", "")}
                      onChange={(e) => handleInputChange(item.cds, "actions", e.target.value)}
                      placeholder="Actions engagées"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={getValue(item.cds, "echeance", "")}
                      onChange={(e) => handleInputChange(item.cds, "echeance", e.target.value)}
                      placeholder="Echéance"
                    />
                  </td>
                  <td className="px-4 py-3 border text-center">
                    <button
                      onClick={() => handleSaveRow(item.cds)}
                      className={`p-2 rounded-md ${
                        savedRows[item.cds] ? "bg-green-500 text-white" : "bg-[#0a2d5e] text-white hover:bg-[#0a3d7e]"
                      }`}
                    >
                      {savedRows[item.cds] ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              )),
            )}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center border">
                  Aucune donnée trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="container mx-auto my-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page ? "bg-[#0a2d5e] text-white" : "border border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
