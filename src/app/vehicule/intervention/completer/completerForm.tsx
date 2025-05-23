"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"

type CompleterFormProps = {
  id_demande: string
  onClose?: () => void
}

export default function CompleterForm({ id_demande, onClose }: CompleterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [vehiculeInfo, setVehiculeInfo] = useState({
    numero_demande: "",
    marque_designation: "",
    type_designation: "",
    genre_designation: "",
    designation_centre: "",
    designation_district: "",
    totalKilo: "",
    id_district: "",
    id_centre: ""

  })
  console.log("id_demande in component:", id_demande)

  const [formValues, setFormValues] = useState({
    id_demande_intervention: id_demande, 
    numero_demande: "",
    etat_demande: "En instance",
    date_application: new Date(),
    date_heure_panne: "",
    structure_maintenance_type: "",
    structure_maintenance_detail: "",
    activite: "Materiel roulant",
    nature_panne: "",
    nature_travaux: "Maintenance Corrective",
    degre_urgence: "3",
    code_vehicule: "",
    district_id: "",
    centre_id: "",
    constat_panne: "",
    nom_prenom_demandeur: "",
    fonction_demandeur: "",
    date_demandeur: new Date(),
    nom_prenom_responsable: "",
    fonction_responsable: "",
    date_responsable: "",
    diagnostique: "",
    description: "",
    niveaux_prio: "",
    necess_permis: false,
    type_permis: "",
    type_permis_ref: "",
    routinier: false,
    routinier_ref: "",
    dangereux: false,
    dangereux_ref: "",
    nom_prenom_HSE: "",
    fonction_HSE: "",
    date_HSE: "",
    nom_prenom_intervenant: "",
    fonction_intervenant: "",
    date_intervevant: new Date(),
    nom_prenom_responsable_QI: "",
    fonction_responsable_QI: "",
    date_responsable_QI: "",
  })

  const options = [
    { value: "cds", label: "CDS" },
    { value: "garage", label: "Garage secondaire / Atelier Réseau" },
    { value: "unm", label: "UNM / District" },
    { value: "canalisation", label: "Unité canalisation", disabled: true },
    { value: "prestataire", label: "Prestataire externe" },
  ]

  const panne = [
    { id: "Mécanique", label: "Mécanique" },
    { id: "Électrique", label: "Électrique" },
    { id: "Autre", label: "Autre" },
  ]

  useEffect(() => {
    const fetchDemandeData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        
        const response = await fetch(`/api/intervention/getDemandeById`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_demande }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la récupération de la demande d'intervention")
        }

        const data = await response.json()
        console.log("Fetched demande data:", data)

        // Parse structure_maintenance to get type and detail
        let structure_type = ""
        let structure_detail = ""

        if (data.structure_maintenance) {
          const parts = data.structure_maintenance.split(",")
          structure_type = parts[0] || ""
          structure_detail = parts[1] || ""
        }

        // Parse nature_panne to set selected items
        const panneItems = data.nature_panne ? data.nature_panne.split("/") : []
        setSelectedItems(panneItems)

        // Set form values from fetched data
        setFormValues((prev) => ({
          ...prev,
          id_demande_intervention: data.id_demande_intervention || id_demande,
          numero_demande: data.numero_demande || "",
          etat_demande: "En instance", 
          date_application: data.date_application ? new Date(data.date_application) : new Date(),
          date_heure_panne: data.date_heure_panne || "",
          structure_maintenance_type: structure_type,
          structure_maintenance_detail: structure_detail,
          activite: data.activite || "Materiel roulant",
          nature_panne: data.nature_panne || "",
          nature_travaux: data.nature_travaux || "Maintenance Corrective",
          degre_urgence: data.degre_urgence || "3",
          code_vehicule: data.code_vehicule || "",
          district_id: data.district_id || "",
          centre_id: data.centre_id || "",
          constat_panne: data.constat_panne || "",
        }))

        // Fetch vehicle info if code_vehicule exists
        if (data.code_vehicule) {
          try {
            const vehiculeResponse = await fetch("/api/vehicule/getVehiculeInfo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code_vehicule: data.code_vehicule }),
            })

            if (vehiculeResponse.ok) {
              const vehiculeData = await vehiculeResponse.json()
              setVehiculeInfo(vehiculeData)
            }
          } catch (vehiculeError) {
            console.error("Error fetching vehicle info:", vehiculeError)
            // Continue with the form even if vehicle info fails
          }
        }
      } catch (err) {
        console.error("Error fetching demande:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading(false)
      }
    }

    if (id_demande) {
      fetchDemandeData()
    } else {
      setError("Identifiant de demande manquant")
      setIsLoading(false)
    }
  }, [id_demande])

  // Update type_permis based on routinier and dangereux
  useEffect(() => {
    if (formValues.necess_permis) {
      if (formValues.routinier) {
        setFormValues((prev) => ({ ...prev, type_permis: "Routinier" }))
      } else if (formValues.dangereux) {
        setFormValues((prev) => ({ ...prev, type_permis: "Dangereux" }))
      }
    } else {
      setFormValues((prev) => ({
        ...prev,
        type_permis: "",
        type_permis_ref: "",
        routinier: false,
        routinier_ref: "",
        dangereux: false,
        dangereux_ref: "",
      }))
    }
  }, [formValues.necess_permis, formValues.routinier, formValues.dangereux])

  const handleItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target
    setSelectedItems((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)))
  }

  const handleSelect = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      structure_maintenance_type: value,
      structure_maintenance_detail: "", // Reset detail when type changes
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleTypePermisChange = (type: string) => {
    if (type === "Routinier") {
      setFormValues((prev) => ({
        ...prev,
        type_permis: "Routinier",
        routinier: true,
        dangereux: false,
        dangereux_ref: "",
      }))
    } else if (type === "Dangereux") {
      setFormValues((prev) => ({
        ...prev,
        type_permis: "Dangereux",
        routinier: false,
        routinier_ref: "",
        dangereux: true,
      }))
    }
  }
  
   const selectedPanne = selectedItems.join("/")

   // Combine structure_maintenance_type and structure_maintenance_detail
   const structureMaintenance = formValues.structure_maintenance_type
     ? `${formValues.structure_maintenance_type}${formValues.structure_maintenance_detail ? `,${formValues.structure_maintenance_detail}` : ""}`
     : ""
  const nvValeur = {
    id_demande_intervention: id_demande,
    diagnostique : formValues.diagnostique ,
description : formValues.description,
niveaux_prio : formValues.niveaux_prio,
necess_permis : formValues.necess_permis,
etat_demande : formValues.etat_demande ,
constat_panne : formValues.constat_panne,
routinier : formValues.routinier,
routinier_ref : formValues.routinier_ref,
dangereux : formValues.dangereux,
dangereux_ref : formValues.dangereux_ref  ,
nom_prenom_intervenant : formValues.nom_prenom_intervenant,
fonction_intervenant : formValues.fonction_intervenant,
date_intervevant: new Date(),
nom_prenom_responsable : formValues.nom_prenom_responsable,
date_responsable : formValues.date_responsable,
fonction_responsable : formValues.fonction_responsable,
date_responsable_unm : formValues.date_responsable_QI ,
fonction_responsable_unm  : formValues.fonction_responsable_QI,
nom_prenom_responsable_unm : formValues.nom_prenom_responsable_QI,
date_hse : formValues.date_HSE , 
fonction_hse : formValues.fonction_HSE ,
nom_prenom_hse : formValues.nom_prenom_HSE
  }
  console.log("values" ,nvValeur);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try { 
      const response = await fetch("/api/intervention/updateDemande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( nvValeur),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour de la demande")
      }

      alert("Demande mise à jour avec succès!")

      if (onClose) {
        onClose()
      } else {
        router.push("/vehicule")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(
        error instanceof Error ? error.message : "Une erreur s'est produite lors de la mise à jour de la demande.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">Erreur</p>
            <p className="text-gray-500 text-center mt-2">{error}</p>
            <button
              onClick={onClose || (() => router.push("/vehicule"))}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="bg-white w-full max-w-5xl shadow-xl rounded-md overflow-hidden"
      >
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-0 w-60 h-24">
                    <img src="/logo-naftal.png" alt="NAFTAL Logo" className="w-full h-full object-contain p-2" />
                  </th>
                  <th className="border-2 border-gray-800 px-7 py-5 w-140 text-2xl font-bold">
                    <h2>COMPLÉTER DEMANDE D&apos;INTERVENTION</h2>
                  </th>
                  <th className="border-2 border-gray-800 py-3 px-4 w-60">
                    <div className="border-b-2 border-gray-800 pb-2 text-center font-semibold">ER.NAF.MNT.20.V1</div>
                    <div className="pt-2">
                      <div className="font-semibold">Date d&apos;application :</div>
                      <div className="text-center mt-1">{new Date().toLocaleDateString("fr-FR")}</div>
                    </div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Section 1: Request Info */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3 w-1/3">
                    <div className="font-bold mb-1">N° :</div>
                    <div className="p-2 bg-gray-100 rounded">{formValues.numero_demande}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3 w-1/3">
                    <div className="font-bold mb-1">District/Autre :</div>
                    <div className="pl-2">{vehiculeInfo.designation_district || "Non spécifié"}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3" rowSpan={2}>
                    <h5 className="font-bold text-center border-b border-gray-400 pb-2 mb-3">
                      Structure Maintenance Destinataire
                    </h5>
                    <div className="space-y-3 pl-2">
                      {options.map((option) => (
                        <div key={option.value} className="mb-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="structure_maintenance_type"
                              value={option.value}
                              checked={formValues.structure_maintenance_type === option.value}
                              onChange={() => handleSelect(option.value)}
                              disabled={option.disabled}
                              className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className={option.disabled ? "text-gray-400" : ""}>{option.label}</span>
                          </label>

                          {formValues.structure_maintenance_type === option.value && (
                            <input
                              type="text"
                              name="structure_maintenance_detail"
                              placeholder={`Détail pour ${option.label}`}
                              onChange={handleChange}
                              value={formValues.structure_maintenance_detail}
                              className="mt-1 px-3 py-2 border border-gray-300 rounded w-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <label htmlFor="date_heure_panne" className="font-bold block mb-1">
                      Date Heure de la panne ou de l&apos;avarie :
                    </label>
                    <input
                      type="datetime-local"
                      id="date_heure_panne"
                      name="date_heure_panne"
                      onChange={handleChange}
                      value={formValues.date_heure_panne}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold mb-1">CDS/Autre :</div>
                    <div className="pl-2">{vehiculeInfo.designation_centre || "Non spécifié"}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-4 w-1/2">
                    <h5 className="font-bold mb-3">Activité :</h5>
                    <div className="space-y-2 pl-2">
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Maintenance Installation fixe</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" checked readOnly className="form-checkbox h-4 w-4 mr-2 text-blue-600" />
                        <span>Matériel Roulant</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Navire</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Autres*</span>
                      </label>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-4">
                    <h5 className="font-bold mb-3">Nature de la Panne :</h5>
                    <div className="space-y-2 pl-2">
                      {panne.map((option) => (
                        <label key={option.id} htmlFor={option.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={option.id}
                            name="nature_panne"
                            value={option.id}
                            checked={selectedItems.includes(option.id)}
                            onChange={handleItems}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 p-4">
                    <h5 className="font-bold mb-3">Nature des travaux :</h5>
                    <div className="space-y-2 pl-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="nature_travaux"
                          value="Maintenance Corrective"
                          onChange={handleChange}
                          checked={formValues.nature_travaux === "Maintenance Corrective"}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>Maintenance Corrective</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="nature_travaux"
                          value="Maintenance Preventive"
                          onChange={handleChange}
                          checked={formValues.nature_travaux === "Maintenance Preventive"}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>Maintenance Préventive</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Travaux Neufs</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Modification</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Expertise</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Vérification Métrologique</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" disabled className="form-checkbox h-4 w-4 mr-2" />
                        <span>Contrôle réglementaire</span>
                      </label>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-4">
                    <h5 className="font-bold mb-3">Degré d&apos;urgence :</h5>
                    <div className="space-y-2 pl-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="degre_urgence"
                          value="1"
                          onChange={handleChange}
                          checked={formValues.degre_urgence === "1"}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>(1) Très urgent</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="degre_urgence"
                          value="2"
                          onChange={handleChange}
                          checked={formValues.degre_urgence === "2"}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>(2) Urgent</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="degre_urgence"
                          value="3"
                          onChange={handleChange}
                          checked={formValues.degre_urgence === "3"}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>(3) Normal</span>
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Vehicle Identification */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Identification du bien</h4>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3 w-1/2">
                    <div className="font-bold">Code:</div>
                    <div className="pl-2 mt-1">{formValues.code_vehicule}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold">Genre:</div>
                    <div className="pl-2 mt-1">{vehiculeInfo.genre_designation || "Non spécifié"}</div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold">Marque:</div>
                    <div className="pl-2 mt-1">{vehiculeInfo.marque_designation}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold">Km et/ou Heures de fonctionnement:</div>
                    <div className="pl-2 mt-1">{vehiculeInfo.totalKilo || "Non spécifié"}</div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold">Type:</div>
                    <div className="pl-2 mt-1">{vehiculeInfo.type_designation}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Breakdown Description */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Constat de la panne</h4>
            </div>
            <div className="p-3">
              <textarea
                id="constat_panne"
                name="constat_panne"
                className="w-full h-40 p-3 border border-gray-300 rounded"
                placeholder="Décrivez le constat de la panne..."
                onChange={handleChange}
                value={formValues.constat_panne}
              />
            </div>
          </div>

          {/* Section 5: Qualification de l'intervention */}
          <div className="border-2 border-gray-800 mb-6">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-2">
              <h4 className="text-center font-bold">Qualification de l'intervention</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="diagnostique" className="font-semibold block mb-2">
                    Diagnostic Préliminaire :
                  </label>
                  <textarea
                    id="diagnostique"
                    name="diagnostique"
                    className="w-full p-3 border border-gray-300 rounded h-32"
                    placeholder="Saisir le diagnostique préliminaire..."
                    onChange={handleChange}
                    value={formValues.diagnostique}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="font-semibold block mb-2">
                    Description de la nature des travaux :
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-3 border border-gray-300 rounded h-32"
                    placeholder="Saisir la description des travaux..."
                    onChange={handleChange}
                    value={formValues.description}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h5 className="font-semibold mb-3">Niveaux de priorisation :</h5>
                  <div className="space-y-2 pl-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="niveaux_prio"
                        value="1"
                        onChange={handleChange}
                        checked={formValues.niveaux_prio === "1"}
                        className="form-radio h-4 w-4 mr-2 text-blue-600"
                      />
                      <span>(1) Priorité haute</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="niveaux_prio"
                        value="2"
                        onChange={handleChange}
                        checked={formValues.niveaux_prio === "2"}
                        className="form-radio h-4 w-4 mr-2 text-blue-600"
                      />
                      <span>(2) Priorité moyenne</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="niveaux_prio"
                        value="3"
                        onChange={handleChange}
                        checked={formValues.niveaux_prio === "3"}
                        className="form-radio h-4 w-4 mr-2 text-blue-600"
                      />
                      <span>(3) Priorité basse</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-3">Nécessitent-ils un permis de travail ? :</h5>
                  <div className="space-y-2 pl-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="necess_permis"
                        checked={formValues.necess_permis === true}
                        onChange={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            necess_permis: true,
                          }))
                        }
                        className="form-radio h-4 w-4 mr-2 text-blue-600"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="necess_permis"
                        checked={formValues.necess_permis === false}
                        onChange={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            necess_permis: false,
                          }))
                        }
                        className="form-radio h-4 w-4 mr-2 text-blue-600"
                      />
                      <span>Non</span>
                    </label>
                  </div>

                  {formValues.necess_permis && (
                    <div className="mt-4 pl-2">
                      <h5 className="font-semibold mb-2">Si oui, s'agit-t-il d'un permis de travail ?</h5>

                      {/* Routinier */}
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="radio"
                          name="type_permis"
                          checked={formValues.type_permis === "Routinier"}
                          onChange={() => handleTypePermisChange("Routinier")}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <label>Routinier - PT Réf :</label>
                        <input
                          type="text"
                          name="routinier_ref"
                          value={formValues.routinier_ref}
                          onChange={handleChange}
                          disabled={formValues.type_permis !== "Routinier"}
                          className="border px-2 py-1 rounded flex-1"
                        />
                      </div>

                      {/* Dangereux */}
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="radio"
                          name="type_permis"
                          checked={formValues.type_permis === "Dangereux"}
                          onChange={() => handleTypePermisChange("Dangereux")}
                          className="form-radio h-4 w-4 mr-2 text-blue-600"
                        />
                        <label>Dangereux - PT Réf :</label>
                        <input
                          type="text"
                          name="dangereux_ref"
                          value={formValues.dangereux_ref}
                          onChange={handleChange}
                          disabled={formValues.type_permis !== "Dangereux"}
                          className="border px-2 py-1 rounded flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-300 pt-6">
                <h5 className="font-semibold mb-3">Informations HSE :</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="nom_prenom_HSE" className="block text-sm font-medium mb-1">
                      Nom & Prénom :
                    </label>
                    <input
                      id="nom_prenom_HSE"
                      name="nom_prenom_HSE"
                      value={formValues.nom_prenom_HSE}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="fonction_HSE" className="block text-sm font-medium mb-1">
                      Fonction :
                    </label>
                    <input
                      id="fonction_HSE"
                      name="fonction_HSE"
                      value={formValues.fonction_HSE}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="date_HSE" className="block text-sm font-medium mb-1">
                      Date :
                    </label>
                    <input
                      type="date"
                      id="date_HSE"
                      name="date_HSE"
                      value={formValues.date_HSE}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Visa HSE :</label>
                  <div className="h-16 border border-dashed border-gray-400 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Signatures */}
          <div className="border-2 border-gray-800">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-3 w-1/2 bg-gray-100">
                    <h4 className="font-bold">Intervenant</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Responsable Qualification</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_prenom_intervenant" className="font-semibold block mb-1">
                          Nom & Prénom :
                        </label>
                        <input
                          id="nom_prenom_intervenant"
                          name="nom_prenom_intervenant"
                          placeholder="Entrez le nom et prénom"
                          onChange={handleChange}
                          value={formValues.nom_prenom_intervenant}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="fonction_intervenant" className="font-semibold block mb-1">
                          Fonction :
                        </label>
                        <input
                          id="fonction_intervenant"
                          name="fonction_intervenant"
                          placeholder="Entrez la fonction"
                          onChange={handleChange}
                          value={formValues.fonction_intervenant}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">Date :</div>
                        <div className="pl-2 mt-1">{new Date().toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Visa :</div>
                        <div className="h-16 border border-dashed border-gray-400 rounded mt-1"></div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_prenom_responsable_QI" className="font-semibold block mb-1">
                          Nom & Prénom :
                        </label>
                        <input
                          id="nom_prenom_responsable_QI"
                          name="nom_prenom_responsable_QI"
                          placeholder="Entrez le nom et prénom"
                          onChange={handleChange}
                          value={formValues.nom_prenom_responsable_QI}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="fonction_responsable_QI" className="font-semibold block mb-1">
                          Fonction :
                        </label>
                        <input
                          id="fonction_responsable_QI"
                          name="fonction_responsable_QI"
                          placeholder="Entrez la fonction"
                          onChange={handleChange}
                          value={formValues.fonction_responsable_QI}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="date_responsable_QI" className="font-semibold block mb-1">
                          Date :
                        </label>
                        <input
                          type="date"
                          name="date_responsable_QI"
                          onChange={handleChange}
                          value={formValues.date_responsable_QI}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">Visa :</div>
                        <div className="h-16 border border-dashed border-gray-400 rounded mt-1"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-4 border-t border-gray-300">
          <button
            type="button"
            onClick={onClose || (() => router.push("/vehicule"))}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 font-medium"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 font-medium flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Enregistrement...
              </>
            ) : (
              <>Confirmer</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
