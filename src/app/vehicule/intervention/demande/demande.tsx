"use client"

import type React from "react"
import type { DemandeIntervention } from "@/app/interfaces"
import { useEffect, useState } from "react"
import MaintenanceGammesSelector from "@/app/components/maintenance-gammes-selector"

type DemandeProps = {
  visible: boolean
  handleCloseModal: () => void
  code_vehicule: string
  onSubmitSuccess?: (demande: DemandeIntervention) => void
}

const Demande: React.FC<DemandeProps> = ({ visible, handleCloseModal, code_vehicule, onSubmitSuccess }) => {
  type Vehicule = {
    marque_designation: string
    type_designation: string
    genre_designation: string
    designation_centre: string
    designation_district: string
    totalKilo: string
    id_district?: string
    id_centre?: string
  }

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [vehiculeInfo, setVehiculeInfo] = useState<Vehicule>({
    marque_designation: "",
    type_designation: "",
    genre_designation: "",
    totalKilo: "",
    designation_centre: "",
    designation_district: "",
  })

  // Add this to the existing state variables
  const [showGammesSelector, setShowGammesSelector] = useState(false)
  const [selectedMaintenanceGammes, setSelectedMaintenanceGammes] = useState<any[]>([])

  // Add state for maintenance work types
  const [maintenanceTypes, setMaintenanceTypes] = useState({
    corrective: false,
    preventive: false,
  })

  // Add state for alerts and loading
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form state with all fields from the interface
  const [formValues, setFormValues] = useState({
    numero_demande: "",
    date_heure_panne: "",
    structure_maintenance_type: "", // cds, garage, unm, etc.
    structure_maintenance_detail: "", // The specific detail
    activite: "Materiel roulant",
    nature_travaux: "", 
    degre_urgence: "3", // Default to Normal
    constat_panne: "",
    nom_prenom_demandeur: "",
    fonction_demandeur: "",
    nom_prenom_responsable: "",
    fonction_responsable: "",
    date_responsable: "",
    diagnostique: "",
    description: "",
    niveaux_prio: "",
    necess_permis: false,
    routinier: false,
    routinier_ref: "",
    dangereux: false,
    dangereux_ref: "",
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

  // Function to determine nature_travaux based on checkbox selections
  const updateNatureTravaux = (corrective: boolean, preventive: boolean) => {
    let natureTravaux = ""

    if (corrective && preventive) {
      // Both selected - corrective takes priority
      natureTravaux = "Maintenance Corrective"
    } else if (corrective) {
      // Only corrective selected
      natureTravaux = "Maintenance Corrective"
    } else if (preventive) {
      // Only preventive selected
      natureTravaux = "Maintenance Preventive"
    }

    setFormValues((prev) => ({
      ...prev,
      nature_travaux: natureTravaux,
    }))
  }

  // Handle maintenance type checkbox changes
  const handleMaintenanceTypeChange = (type: "corrective" | "preventive", checked: boolean) => {
    const newMaintenanceTypes = {
      ...maintenanceTypes,
      [type]: checked,
    }

    setMaintenanceTypes(newMaintenanceTypes)
    updateNatureTravaux(newMaintenanceTypes.corrective, newMaintenanceTypes.preventive)

    if (type === "preventive" && checked) {
      setShowGammesSelector(true)
    }
  }

  useEffect(() => {
    const fetchVehicule = async () => {
      try {
        const response = await fetch("/api/vehicule/getVehiculeInfo", {
          method: "POST",
          body: JSON.stringify({ code_vehicule: code_vehicule }),
        })
        const data: Vehicule = await response.json()
        console.log(data)

        setVehiculeInfo(data)
      } catch (error) {
        console.error("Error fetching vehicle info:", error)
      }
    }

    if (visible) {
      fetchVehicule()
      // Reset form when modal opens
      setFormValues({
        numero_demande: "", // Don't auto-generate
        date_heure_panne: "",
        structure_maintenance_type: "",
        structure_maintenance_detail: "",
        activite: "Materiel roulant",
        nature_travaux: "",
        degre_urgence: "3", // Default to Normal
        constat_panne: "",
        nom_prenom_demandeur: "",
        fonction_demandeur: "",
        nom_prenom_responsable: "",
        fonction_responsable: "",
        date_responsable: "",
        diagnostique: "",
        description: "",
        niveaux_prio: "",
        necess_permis: false,
        routinier: false,
        routinier_ref: "",
        dangereux: false,
        dangereux_ref: "",
      })
      setSelectedItems([])
      setMaintenanceTypes({ corrective: false, preventive: false })
      setIsSubmitting(false)
      setShowSuccess(false)
      setShowError(false)
    }
  }, [code_vehicule, visible])

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

  const handleMaintenanceGammesSelect = (selectedGammes: any[]) => {
    setSelectedMaintenanceGammes(selectedGammes)

    // Format the selected gammes for the constat_panne field
    if (selectedGammes.length > 0) {
      const formattedGammes = selectedGammes
        .map((gamme) => `${gamme.operation_designation}.${gamme.gamme_designation}`)
        .join(", ")

      setFormValues((prev) => ({
        ...prev,
        constat_panne: ` ${formattedGammes}`,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create a DemandeIntervention object from form values
    const selectedPanne = selectedItems.join("/")

    // Combine structure_maintenance_type and structure_maintenance_detail
    const structureMaintenance = formValues.structure_maintenance_type
      ? `${formValues.structure_maintenance_type}${formValues.structure_maintenance_detail ? `,${formValues.structure_maintenance_detail}` : ""}`
      : ""

    // Use the provided numero_demande
    const numeroDemande = formValues.numero_demande

    const demandeIntervention: DemandeIntervention = {
      numero_demande: numeroDemande,
      etat_demande: "incomplet",
      date_application: new Date(),
      date_heure_panne: formValues.date_heure_panne,
      structure_maintenance: structureMaintenance,
      activite: formValues.activite,
      nature_panne: selectedPanne,
      nature_travaux: formValues.nature_travaux,
      degre_urgence: formValues.degre_urgence,
      code_vehicule: code_vehicule,
      district_id: vehiculeInfo.designation_district,
      centre_id: vehiculeInfo.designation_centre,
      constat_panne: formValues.constat_panne,
      diagnostique: formValues.diagnostique,
      description: formValues.description,
      niveaux_prio: formValues.niveaux_prio ? Number(formValues.niveaux_prio) : undefined,
      necess_permis: formValues.necess_permis,
      routinier: formValues.routinier,
      routinier_ref: formValues.routinier_ref,
      dangereux: formValues.dangereux,
      dangereux_ref: formValues.dangereux_ref,
      nom_prenom_demandeur: formValues.nom_prenom_demandeur,
      fonction_demandeur: formValues.fonction_demandeur,
      date_demandeur: new Date(),
      nom_prenom_responsable: formValues.nom_prenom_responsable,
      date_responsable: formValues.date_responsable,
      fonction_responsable: formValues.fonction_responsable,
    }

    console.log("Demande d'intervention à soumettre:", demandeIntervention)
    const newErrors: { [key: string]: string } = {};

  // Required fields
  if (!formValues.numero_demande.trim()) newErrors.numero_demande = "Ce champ est requis";
  if (!formValues.date_heure_panne) newErrors.date_heure_panne = "Veuillez choisir une date";
  if (!formValues.structure_maintenance_type) newErrors.structure_maintenance_type = "Veuillez cocher sur une case";
  if (!formValues.structure_maintenance_detail.trim()) newErrors.structure_maintenance_detail = "Ce champ est requis";
  if (!selectedPanne) newErrors.selectedPanne = "Veuillez cocher sur une case";
  if (!formValues.nature_travaux) newErrors.nature_travaux = "Veuillez cocher sur une case";
  if (!formValues.constat_panne.trim()) newErrors.constat_panne = "Ce champ est requis";
  if (!formValues.nom_prenom_demandeur.trim()) newErrors.nom_prenom_demandeur = "Ce champ est requis";
  if (!formValues.fonction_demandeur.trim()) newErrors.fonction_demandeur = "Ce champ est requis";
  if (!formValues.nom_prenom_responsable.trim()) newErrors.nom_prenom_responsable = "Ce champ est requis";
  if (!formValues.fonction_responsable.trim()) newErrors.fonction_responsable = "Ce champ est requis";
  if (!formValues.date_responsable) newErrors.date_responsable = "Veuillez choisir une date";

  setErrors(newErrors);
  if (Object.keys(newErrors).length === 0){
    try {
      const response = await fetch("/api/intervention/ajouterDemande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demandeIntervention),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission de la demande")
      }

      const result = await response.json()

      // Set success message with the demande number
      setSuccessMessage(`Demande ${numeroDemande} enregistrée avec succès!`)

      // Show success alert
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        handleCloseModal()
      }, 1000)

      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(demandeIntervention)
      }
    } catch (error) {
      console.error("Erreur:", error)
      setErrorMessage("Une erreur s'est produite lors de la soumission de la demande.")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      setIsSubmitting(false)
    }}
    else setIsSubmitting(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
      {/* Success Alert */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{successMessage || "Demande enregistrée avec succès!"}</span>
        </div>
      )}

      {/* Error Alert */}
      {showError && (
        <div className="fixed top-4 right-4 z-[100] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

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
                    <h2>DEMANDE D'INTERVENTION</h2>
                  </th>
                  <th className="border-2 border-gray-800 py-3 px-4 w-60">
                    <div className="border-b-2 border-gray-800 pb-2 text-center font-semibold">ER.NAF.MNT.20.V1</div>
                    <div className="pt-2">
                      <div className="font-semibold">Date d'application :</div>
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
                    <input
                      id="numero_demande"
                      name="numero_demande"
                      onChange={handleChange}
                      value={formValues.numero_demande}
                      className={`w-full p-2 border rounded ${errors.numero_demande ? 'border-red-500' : 'border-gray-300'}`}
                    /> {errors.numero_demande && <p className="text-red-500 text-sm mt-1">{errors.numero_demande}</p>}
                  </td>
                  <td className="border-2 border-gray-800 p-3 w-1/3">
                    <div className="font-bold mb-1">District/Autre :</div>
                    <div className="pl-2">{vehiculeInfo.designation_district || "Attendez le chargement..."}</div>
                  </td>
                  <td className="border-2 border-gray-800 p-3" rowSpan={2}>
                    <h5 className="font-bold text-center border-b border-gray-400 pb-2 mb-3">
                      Structure Maintenance Destinataire
                    </h5>
                    <div className="space-y-3 pl-2">
                      {errors.structure_maintenance_type && <p className="text-red-500 text-sm mt-1">{errors.structure_maintenance_type}</p>}
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
                              placeholder={`${errors.structure_maintenance_detail 
                                ? "Ce champ est requis"
                                : `Détail pour ${option.label}`}`}
                              onChange={handleChange}
                              value={formValues.structure_maintenance_detail}
                              className={`mt-1 px-3 py-2 border ${errors.structure_maintenance_detail ? 'border-red-500' : 'border-gray-300'} rounded w-full`}
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
                      Date Heure de la panne ou de l'avarie :
                    </label>
                    <input
                      type="datetime-local"
                      id="date_heure_panne"
                      name="date_heure_panne"
                      onChange={handleChange}
                      value={formValues.date_heure_panne}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {errors.date_heure_panne && <p className="text-red-500 text-sm mt-1">{errors.date_heure_panne}</p>}
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="font-bold mb-1">CDS/Autre :</div>
                    <div className="pl-2">{vehiculeInfo.designation_centre || "Attendez le chargement"}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Activity and Breakdown */}
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
                      {errors.selectedPanne && (<p className="text-red-500 text-sm mt-1">{errors.selectedPanne}</p>)}
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
                      {errors.nature_travaux && (<p className="text-red-500 text-sm mt-1">{errors.nature_travaux}</p>)}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={maintenanceTypes.corrective}
                          onChange={(e) => handleMaintenanceTypeChange("corrective", e.target.checked)}
                          className="form-checkbox h-4 w-4 mr-2 text-blue-600"
                        />
                        <span>Maintenance Corrective</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={maintenanceTypes.preventive}
                          onChange={(e) => handleMaintenanceTypeChange("preventive", e.target.checked)}
                          className="form-checkbox h-4 w-4 mr-2 text-blue-600"
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
                    <div className="pl-2 mt-1">{code_vehicule}</div>
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
                    <div className="pl-2 mt-1">{vehiculeInfo.totalKilo || "0"}</div>
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
                className={`w-full h-40 p-3 border ${errors.constat_panne ? "border-red-500" : "border-gray-300"} rounded`}
                placeholder="Décrivez le constat de la panne..."
                onChange={handleChange}
                value={formValues.constat_panne}
              />
              {errors.constat_panne && (<p className="text-red-500 text-sm mt-1">{errors.constat_panne}</p>)}
            </div>
          </div>

          <div className="border-2 border-gray-800">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-3 w-1/2 bg-gray-100">
                    <h4 className="font-bold">Demandeur</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Responsable CDS Autres</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nom_prenom_demandeur" className="font-semibold block mb-1">
                          Nom & Prénom :
                        </label>
                        <input
                          id="nom_prenom_demandeur"
                          name="nom_prenom_demandeur"
                          placeholder="Entrez le nom et prénom"
                          onChange={handleChange}
                          value={formValues.nom_prenom_demandeur}
                          className={`w-full p-2 border ${errors.nom_prenom_demandeur ? "border-red-500" : "border-gray-300"} rounded`}
                        />
                        {errors.nom_prenom_demandeur && (<p className="text-red-500 text-sm mt-1">{errors.nom_prenom_demandeur}</p>)}
                      </div>
                      <div>
                        <label htmlFor="fonction_demandeur" className="font-semibold block mb-1">
                          Fonction :
                        </label>
                        <input
                          id="fonction_demandeur"
                          name="fonction_demandeur"
                          placeholder="Entrez la fonction"
                          onChange={handleChange}
                          value={formValues.fonction_demandeur}
                          className={`w-full p-2 border ${errors.fonction_demandeur ? "border-red-500" : "border-gray-300"} rounded`}
                        />
                        {errors.fonction_demandeur && (<p className="text-red-500 text-sm mt-1">{errors.fonction_demandeur}</p>)}
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
                        <label htmlFor="nom_prenom_responsable" className="font-semibold block mb-1">
                          Nom & Prénom :
                        </label>
                        <input
                          id="nom_prenom_responsable"
                          name="nom_prenom_responsable"
                          placeholder="Entrez le nom et prénom"
                          onChange={handleChange}
                          value={formValues.nom_prenom_responsable}
                          className={`w-full p-2 border ${errors.nom_prenom_responsable ? "border-red-500" : "border-gray-300"} rounded`}
                        />
                        {errors.nom_prenom_responsable && (<p className="text-red-500 text-sm mt-1">{errors.nom_prenom_responsable}</p>)}
                      </div>
                      <div>
                        <label htmlFor="fonction_responsable" className="font-semibold block mb-1">
                          Fonction :
                        </label>
                        <input
                          id="fonction_responsable"
                          name="fonction_responsable"
                          placeholder="Entrez la fonction"
                          onChange={handleChange}
                          value={formValues.fonction_responsable}
                          className={`w-full p-2 border ${errors.fonction_responsable ? "border-red-500" : "border-gray-300"} rounded`}
                        />
                        {errors.fonction_responsable && (<p className="text-red-500 text-sm mt-1">{errors.fonction_responsable}</p>)}
                      </div>
                      <div>
                        <label htmlFor="date_responsable" className="font-semibold block mb-1">
                          Date :
                        </label>
                        <input
                          type="date"
                          name="date_responsable"
                          onChange={handleChange}
                          value={formValues.date_responsable}
                          className={`w-full p-2 border ${errors.date_responsable ? "border-red-500" : "border-gray-300"} rounded`}
                        />
                        {errors.date_responsable && (<p className="text-red-500 text-sm mt-1">{errors.date_responsable}</p>)}
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
            onClick={handleCloseModal}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </form>
      {/* Maintenance Gammes Selector Modal */}
      <MaintenanceGammesSelector
        visible={showGammesSelector}
        onClose={() => setShowGammesSelector(false)}
        code_vehicule={code_vehicule}
        onSelect={handleMaintenanceGammesSelect}
      />

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Demande
