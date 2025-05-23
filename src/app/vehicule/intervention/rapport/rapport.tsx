"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { RapportIntervention } from "@/app/interfaces"
import { Plus, Trash2, X, Loader2 } from "lucide-react"
import { NextRequest } from 'next/server';

export default function FormRapport({
  id_demande_intervention,
  onClose,
}: { id_demande_intervention: string; onClose?: () => void }) {
  type infos = {
    structure_maintenance: string
    date_heure_panne: Date
    numero_demande: string
    district_id: string
    centre_id: string
  }

  // Internal work table structure
  type InternalWorkItem = {
    id: string
    description: string
    atelier: string
    temps_alloue: number
    pdr_consomme: string
    cout: number
    reference: string
  }

  // External work table structure
  type ExternalWorkItem = {
    id: string
    description: string
    prestataire: string
    reference_contrat: string
    reference_facture: string
    cout: number
  }

  const [Data, setData] = useState<infos>({
    structure_maintenance: "",
    numero_demande: "",
    date_heure_panne: new Date(),
    district_id: "",
    centre_id: "",
  })

  const [internalWorkItems, setInternalWorkItems] = useState<InternalWorkItem[]>([])
  const [externalWorkItems, setExternalWorkItems] = useState<ExternalWorkItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [FormValue, SetFormValue] = useState<RapportIntervention>({
    id_demande_intervention: Number(id_demande_intervention) ,
    
    id_rapport_intervention: "",
    structure_maintenance_charge: "",
    date_application: new Date(),
    date_debut_travaux: "",
    date_fin_travaux: "",
    date_panne: new Date(),
    date_prise_charge: "",
    duree_travaux: "",
    numero_OR: "",
    district: "",
    centre: "",
    description_essais: "",
    essais: "oui",
    reservation: "",
    cout_total_traveaux_interne: 0,
    cout_total_traveaux_externe: 0,
    reference_documentée: "",
    date_fin_permis: "",
    nom_utilisateur: "",
    date_utilisateur: new Date(),
    nom_prenom_demandeur: "",
    date_demandeur: "",
    nom_prenom_responsable: "",
    date_responsable: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    SetFormValue((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add new internal work item
  const addInternalWorkItem = () => {
    const newItem: InternalWorkItem = {
      id: Date.now().toString(),
      description: "",
      atelier: "",
      temps_alloue: 0,
      pdr_consomme: "",
      cout: 0,
      reference: "",
    }
    setInternalWorkItems([...internalWorkItems, newItem])
  }

  // Add new external work item
  const addExternalWorkItem = () => {
    const newItem: ExternalWorkItem = {
      id: Date.now().toString(),
      description: "",
      prestataire: "",
      reference_contrat: "",
      reference_facture: "",
      cout: 0,
    }
    setExternalWorkItems([...externalWorkItems, newItem])
  }

  // Handle internal work item change
  const handleInternalWorkItemChange = (id: string, field: keyof InternalWorkItem, value: string | number) => {
    setInternalWorkItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Handle external work item change
  const handleExternalWorkItemChange = (id: string, field: keyof ExternalWorkItem, value: string | number) => {
    setExternalWorkItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Remove internal work item
  const removeInternalWorkItem = (id: string) => {
    setInternalWorkItems((items) => items.filter((item) => item.id !== id))
  }

  // Remove external work item
  const removeExternalWorkItem = (id: string) => {
    setExternalWorkItems((items) => items.filter((item) => item.id !== id))
  }

  // Save work items to database
  const saveWorkItems = async (id_rapport: string) => {
    try {
      // Filter out items with empty descriptions
      const validInternalItems = internalWorkItems.filter((item) => item.description.trim() !== "")
      const validExternalItems = externalWorkItems.filter((item) => item.description.trim() !== "")
       console.log(validExternalItems);
       
      if (validInternalItems.length === 0 && validExternalItems.length === 0) {
        console.log("Aucun travail à enregistrer")
        return { success: true }
      }

      const response = await fetch("/api/rapport/ajouterTravaux", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_rapport,
          travauxInternes: validInternalItems,
          travauxExternes: validExternalItems,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'ajout des travaux")
      }

      const data = await response.json()
      console.log("Travaux enregistrés:", data)
      return data
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des travaux:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (FormValue.essais === "oui") FormValue.reservation = ""

    try {
      // Calculate totals before submitting
      const internalTotal = internalWorkItems.reduce((sum, item) => sum + (Number(item.cout) || 0), 0)
      const externalTotal = externalWorkItems.reduce((sum, item) => sum + (Number(item.cout) || 0), 0)

      const rapportInfos: RapportIntervention = {
        ...FormValue,
        structure_maintenance_charge: Data.structure_maintenance || FormValue.structure_maintenance_charge,
        date_panne: new Date(Data.date_heure_panne),
        district: Data.district_id || FormValue.district,
        centre: Data.centre_id || FormValue.centre,
        cout_total_traveaux_interne: internalTotal,
        cout_total_traveaux_externe: externalTotal,
      }

      console.log("Submitting rapport:", rapportInfos)

      // Step 1: Save the rapport
      const rapportResponse = await fetch("/api/rapport/ajouterRapport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rapportInfos),
      })

      if (!rapportResponse.ok) {
        const errorData = await rapportResponse.json()
        throw new Error(errorData.error || "Erreur lors de l'ajout du rapport")
      }

      const rapportData = await rapportResponse.json()
      console.log("Rapport ajouté:", rapportData)

      console.log("Saving work items for rapport ID:", rapportInfos.id_rapport_intervention);
      
      if (rapportInfos.id_rapport_intervention) {
        await saveWorkItems(rapportInfos.id_rapport_intervention)
      }

      setSuccessMessage("Rapport et travaux enregistrés avec succès!")

      // Wait a moment to show the success message before closing
      setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 2000)
    } catch (error) {
      console.error("Error in FormRapport:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors de l'ajout du rapport")
    } finally {
      setIsLoading(false)
    }
  }

  function formatHeureToInputValue(date: Date | string | null) {
    if (!date) return ""
    const parsedDate = typeof date === "string" ? new Date(date) : date
    return parsedDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  function formatDateToInputValue(date?: Date | string | null) {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  // Calculate work duration
  useEffect(() => {
    if (FormValue.date_debut_travaux && FormValue.date_fin_travaux) {
      const start = new Date(FormValue.date_debut_travaux)
      const end = new Date(FormValue.date_fin_travaux)

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime()

        if (diffMs >= 0) {
          const totalMinutes = Math.floor(diffMs / (1000 * 60))
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60

          const formatted = `${hours}h ${minutes}min`

          SetFormValue((prev) => ({
            ...prev,
            duree_travaux: formatted,
          }))
        }
      }
    }
  }, [FormValue.date_debut_travaux, FormValue.date_fin_travaux])

  // Handle essais field
  useEffect(() => {
    if (FormValue.essais === "oui") {
      SetFormValue((prev) => ({
        ...prev,
        reservation: "",
      }))
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [FormValue.essais])

  // Calculate totals whenever work items change
  useEffect(() => {
    const internalTotal = internalWorkItems.reduce((sum, item) => sum + (Number(item.cout) || 0), 0)
    SetFormValue((prev) => ({
      ...prev,
      cout_total_traveaux_interne: internalTotal,
    }))
  }, [internalWorkItems])

  useEffect(() => {
    const externalTotal = externalWorkItems.reduce((sum, item) => sum + (Number(item.cout) || 0), 0)
    SetFormValue((prev) => ({
      ...prev,
      cout_total_traveaux_externe: externalTotal,
    }))
  }, [externalWorkItems])

  // Fetch demand info
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/rapport/getDemandeInfos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_demande_intervention: id_demande_intervention || "2" }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la récupération des informations")
        }

        const data = await response.json()
        console.log("Fetched data from API:", data)

        setData(data)

        // Update FormValue with the fetched data
        SetFormValue((prev) => ({
          ...prev,
          structure_maintenance_charge: data.structure_maintenance || "",
          district: data.district_id || "",
          centre: data.centre_id || "",
        }))
      } catch (error) {
        console.error("Error fetching demand info:", error)
        setError(
          error instanceof Error ? error.message : "Une erreur s'est produite lors de la récupération des données",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id_demande_intervention])
  // pour diviser la structure maintenance en charge en 2
      let structure_type = ""
      let structure_detail = ""
      if(Data?.structure_maintenance) {
        const parts = Data.structure_maintenance.split(',')
        structure_type = parts[0] || ''
        structure_detail = parts[1] || ''
      }
  if (isLoading && !FormValue.structure_maintenance_charge) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium">Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">Erreur</p>
            <p className="text-gray-500 text-center mt-2">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (successMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-green-600">Succès</p>
            <p className="text-gray-500 text-center mt-2">{successMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-100 p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Rapport d'Intervention</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Fermer">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-2 border-gray-800">
                  <th className="border-2 border-gray-800 p-0 w-60 h-24">
                    <img src="/logo-naftal.png" alt="NAFTAL Logo" className="w-full h-full object-contain p-2" />
                  </th>
                  <th className="border-2 border-gray-800 px-7 py-5 w-140 text-2xl font-bold">
                    <h2>RAPPORT D&apos;INTERVENTION</h2>
                  </th>
                  <th className="border-2 border-gray-800 py-3 px-4 w-60">
                    <div className="border-b-2 border-gray-800 pb-2 text-center font-semibold">ER.NAF.MNT.20.V1</div>
                    <div className="pt-2">
                      <div className="font-semibold">Date d&apos;application :</div>
                      <div className="text-center mt-1">{FormValue.date_application.toLocaleDateString("fr-FR")}</div>
                    </div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Section 1: Basic Info */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800 p-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <label htmlFor="id_rapport_intervention" className="font-semibold w-10">
                          N° :
                        </label>
                        <input
                          id="id_rapport_intervention"
                          name="id_rapport_intervention"
                          onChange={handleChange}
                          value={FormValue.id_rapport_intervention}
                          className="px-2 py-1 border border-gray-300 rounded flex-1"
                        />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Structure Maintenance en charge des travaux :</div>
                        <div className="px-2 py-1 bg-gray-100 rounded">
                          {structure_detail || FormValue.structure_maintenance_charge || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">DI N° :</div>
                    <div className="px-2 py-1 bg-gray-100 rounded">{Data.numero_demande}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold text-center">Appartenance du Bien</div>
                  </td>
                </tr>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Date et heure début des travaux :</div>
                    <input
                      type="datetime-local"
                      id="date_debut_travaux"
                      name="date_debut_travaux"
                      onChange={handleChange}
                      value={FormValue.date_debut_travaux}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Date et Heure de la panne ou de l'avarie :</div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <span className="w-10">Le</span>
                        <div className="px-2 py-1 bg-gray-100 rounded flex-1">
                          {formatDateToInputValue(Data.date_heure_panne)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-10">à</span>
                        <div className="px-2 py-1 bg-gray-100 rounded flex-1">
                          {formatHeureToInputValue(Data.date_heure_panne)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">District / Autre:</div>
                    <div className="px-2 py-1 bg-gray-100 rounded">
                      {Data.district_id || FormValue.district || "Non spécifié"}
                    </div>
                  </td>
                </tr>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Date et heure fin des travaux :</div>
                    <input
                      type="datetime-local"
                      id="date_fin_travaux"
                      name="date_fin_travaux"
                      onChange={handleChange}
                      value={FormValue.date_fin_travaux}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="flex items-center">
                      <label htmlFor="numero_OR" className="font-semibold w-16">
                        OR N° :
                      </label>
                      <input
                        id="numero_OR"
                        name="numero_OR"
                        onChange={handleChange}
                        value={FormValue.numero_OR}
                        className="px-2 py-1 border border-gray-300 rounded flex-1"
                      />
                    </div>
                  </td>
                  <td rowSpan={2} className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Centre / Autre:</div>
                    <div className="px-2 py-1 bg-gray-100 rounded">
                      {Data.centre_id || FormValue.centre || "Non spécifié"}
                    </div>
                  </td>
                </tr>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Durée des travaux :</div>
                    <div className="px-2 py-1 bg-gray-100 rounded">
                      {FormValue.duree_travaux || "Calculé automatiquement"}
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-semibold mb-1">Date et heure de prise en charge des travaux :</div>
                    <input
                      type="datetime-local"
                      id="date_prise_charge"
                      name="date_prise_charge"
                      onChange={handleChange}
                      value={FormValue.date_prise_charge}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Internal Work Table */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Liste des Travaux exécutés En Interne</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-800 p-2 text-sm">Description des travaux</th>
                    <th className="border border-gray-800 p-2 text-sm">Atelier et/ou Intervenant</th>
                    <th className="border border-gray-800 p-2 text-sm">Temps alloué (h)</th>
                    <th className="border border-gray-800 p-2 text-sm">PDR Consommée</th>
                    <th className="border border-gray-800 p-2 text-sm">Coût PDR</th>
                    <th className="border border-gray-800 p-2 text-sm">Référence BC/BS/BTM</th>
                    <th className="border border-gray-800 p-2 text-sm w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internalWorkItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleInternalWorkItemChange(item.id, "description", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.atelier}
                          onChange={(e) => handleInternalWorkItemChange(item.id, "atelier", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="number"
                          value={item.temps_alloue}
                          onChange={(e) =>
                            handleInternalWorkItemChange(
                              item.id,
                              "temps_alloue",
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                      <input
                          type="text"
                          value={item.pdr_consomme}
                          onChange={(e) => handleInternalWorkItemChange(item.id, "pdr_consomme", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="number"
                          value={item.cout}
                          onChange={(e) =>
                            handleInternalWorkItemChange(item.id, "cout", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.reference}
                          onChange={(e) => handleInternalWorkItemChange(item.id, "reference", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeInternalWorkItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="border border-gray-800 p-2">
                      <button
                        type="button"
                        onClick={addInternalWorkItem}
                        className="flex items-center justify-center w-full py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border border-gray-800 p-2 text-right">
                      Total:
                    </td>
                    <td className="border border-gray-800 p-2">
                      {FormValue.cout_total_traveaux_interne.toLocaleString("fr-FR")} DA
                    </td>
                    <td colSpan={2} className="border border-gray-800"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: External Work Table */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Liste des travaux réalisés en Externe</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-800 p-2 text-sm">Description des travaux</th>
                    <th className="border border-gray-800 p-2 text-sm">Désignation du Prestataire</th>
                    <th className="border border-gray-800 p-2 text-sm">Référence du Contrat et/ou Bon commande</th>
                    <th className="border border-gray-800 p-2 text-sm">Référence de la Facture</th>
                    <th className="border border-gray-800 p-2 text-sm">Coût facturé</th>
                    <th className="border border-gray-800 p-2 text-sm w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {externalWorkItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleExternalWorkItemChange(item.id, "description", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.prestataire}
                          onChange={(e) => handleExternalWorkItemChange(item.id, "prestataire", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.reference_contrat}
                          onChange={(e) => handleExternalWorkItemChange(item.id, "reference_contrat", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="text"
                          value={item.reference_facture}
                          onChange={(e) => handleExternalWorkItemChange(item.id, "reference_facture", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2">
                        <input
                          type="number"
                          value={item.cout}
                          onChange={(e) =>
                            handleExternalWorkItemChange(item.id, "cout", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-800 p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeExternalWorkItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={6} className="border border-gray-800 p-2">
                      <button
                        type="button"
                        onClick={addExternalWorkItem}
                        className="flex items-center justify-center w-full py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border border-gray-800 p-2 text-right">
                      Total:
                    </td>
                    <td className="border border-gray-800 p-2">
                      {FormValue.cout_total_traveaux_externe.toLocaleString("fr-FR")} DA
                    </td>
                    <td className="border border-gray-800"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Tests and Documentation */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Essais et Tests de fonctionnement</h4>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description_essais" className="block font-semibold mb-2">
                  Nature des Essais et/ou tests de fonctionnement réalisés (Description sommaire) :
                </label>
                <textarea
                  id="description_essais"
                  name="description_essais"
                  onChange={handleChange}
                  value={FormValue.description_essais}
                  className="w-full px-3 py-2 border border-gray-300 rounded min-h-[100px]"
                  placeholder="Saisir la nature des essais ou/et tests de fonctionnement réalisés..."
                />
              </div>

              <div>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Essais et/ou tests concluants ?</p>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="essais"
                        id="essais-oui"
                        value="oui"
                        checked={FormValue.essais === "oui"}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Oui
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="essais"
                        id="essais-non"
                        value="non"
                        checked={FormValue.essais === "non"}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Non
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="reservation" className="block font-semibold mb-2">
                    Si non, Réserves :
                  </label>
                  <input
                    type="text"
                    id="reservation"
                    name="reservation"
                    onChange={handleChange}
                    value={FormValue.reservation || ""}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Précisez les réserves..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-300">
              <div>
                <label htmlFor="reference_documentée" className="block font-semibold mb-2">
                  La Référence(s) documentée(s) :
                </label>
                <input
                  type="text"
                  id="reference_documentée"
                  name="reference_documentée"
                  onChange={handleChange}
                  value={FormValue.reference_documentée}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="date_fin_permis" className="block font-semibold mb-2">
                  Date fin permis de travail :
                </label>
                <input
                  type="date"
                  id="date_fin_permis"
                  name="date_fin_permis"
                  onChange={handleChange}
                  value={FormValue.date_fin_permis}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Signatures */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Etabli par</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Vérifié par</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Validé par</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Intervenant :</h5>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_utilisateur" className="block text-sm font-medium mb-1">
                          Nom et Prénom :
                        </label>
                        <input
                          type="text"
                          id="nom_utilisateur"
                          name="nom_utilisateur"
                          onChange={handleChange}
                          value={FormValue.nom_utilisateur}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date :</label>
                        <div className="px-3 py-2 bg-gray-100 rounded">
                          {FormValue.date_utilisateur.toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visa :</label>
                        <div className="h-16 border border-dashed border-gray-400 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Responsable Maintenance :</h5>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_prenom_responsable" className="block text-sm font-medium mb-1">
                          Nom et Prénom :
                        </label>
                        <input
                          type="text"
                          id="nom_prenom_responsable"
                          name="nom_prenom_responsable"
                          onChange={handleChange}
                          value={FormValue.nom_prenom_responsable}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="date_responsable" className="block text-sm font-medium mb-1">
                          Date :
                        </label>
                        <input
                          type="date"
                          id="date_responsable"
                          name="date_responsable"
                          onChange={handleChange}
                          value={FormValue.date_responsable}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visa :</label>
                        <div className="h-16 border border-dashed border-gray-400 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Demandeur :</h5>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_prenom_demandeur" className="block text-sm font-medium mb-1">
                          Nom et Prénom :
                        </label>
                        <input
                          type="text"
                          id="nom_prenom_demandeur"
                          name="nom_prenom_demandeur"
                          onChange={handleChange}
                          value={FormValue.nom_prenom_demandeur}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="date_demandeur" className="block text-sm font-medium mb-1">
                          Date :
                        </label>
                        <input
                          type="date"
                          id="date_demandeur"
                          name="date_demandeur"
                          onChange={handleChange}
                          value={FormValue.date_demandeur}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visa :</label>
                        <div className="h-16 border border-dashed border-gray-400 rounded"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Enregistrement...
                </>
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
