"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"

// Add print-specific styles
const printStyles = `
  @media print {
    /* Scale content to fit on one page with better margins */
    html, body {
      height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
    }
    
    /* Hide URL and timestamp in print footer */
    @page {
      size: A4;
      margin: 0;
    }
    
    .print-container {
      font-size: 8.5pt !important;
      width: 95%;
      max-width: 95%;
      margin: 0 auto;
      transform: scale(0.92);
      transform-origin: top center;
      height: 100%;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    
    table {
      page-break-inside: avoid;
      font-size: 8.5pt !important;
      margin-bottom: 0.2rem !important;
    }
    
    td, th {
      padding: 1px !important;
    }
    
    .mb-6 {
      margin-bottom: 0.3rem !important;
    }
    
    .mb-3, .mb-2 {
      margin-bottom: 0.15rem !important;
    }
    
    .p-3, .p-4 {
      padding: 0.3rem !important;
    }
    
    .p-2 {
      padding: 0.2rem !important;
    }
    
    .p-1 {
      padding: 0.1rem !important;
    }
    
    .space-y-3 > * + *, .space-y-1 > * + * {
      margin-top: 0.15rem !important;
    }
    
    /* Reduce border widths */
    .border-2 {
      border-width: 1px !important;
    }
    
    /* Reduce heights of some elements */
    .h-24 {
      height: 4.5rem !important;
    }
    
    /* Adjust font sizes for headers */
    h2 {
      font-size: 16pt !important;
    }
    
    h4, h5 {
      font-size: 10pt !important;
      margin: 0 !important;
    }
    
    /* Reduce min-height for description areas */
    .min-h-\\[200px\\] {
      min-height: 100px !important;
    }
    
    .min-h-\\[60px\\] {
      min-height: 30px !important;
    }
    
    /* Hide any unnecessary elements when printing */
    .print:hidden {
      display: none !important;
    }
    
    /* Adjust footer text */
    .mt-6 {
      margin-top: 0.3rem !important;
    }
  }
`

type ConstaterDemandeProps = {
  id_demande_intervention: string
}

type DemandeIntervention = {
  id_demande_intervention: string
  numero_demande : string
  etat_demande: string
  date_application: string
  date_heure_panne: string
  structure_maintenance: string
  activite: string
  nature_panne: string
  nature_travaux: string
  degre_urgence: string
  code_vehicule: string
  district_id: string
  centre_id: string
  constat_panne: string | null
  diagnostique: string | null
  description: string | null
  niveaux_prio: string | null
  nom_prenom_demandeur: string | null
  fonction_demandeur: string | null
  date_demandeur: string | null
  nom_prenom_responsable: string | null
  fonction_responsable: string | null
  date_responsable: string
  nom_prenom_intervenant: string | null
  fonction_intervenant: string | null
  date_intervevant: string | null
  nom_prenom_responsable_unm: string | null
  fonction_responsable_unm: string | null
  date_responsable_unm: string | null
  necess_permis: boolean
  type_permis: string | null
  routinier: boolean
  routinier_ref: string | null
  dangereux: boolean
  dangereux_ref: string | null
  nom_prenom_HSE: string | null
  fonction_HSE: string | null
  date_HSE: string | null
}

type VehiculeInfo = {
  marque_designation: string
  type_designation: string
  genre_designation: string
  designation_centre: string
  designation_district: string
  totalKilo: string
}
export default function ConstaterDemande({ id_demande_intervention }: ConstaterDemandeProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demande, setDemande] = useState<DemandeIntervention | null>(null)
  const [vehiculeInfo, setVehiculeInfo] = useState<VehiculeInfo>({
    marque_designation: "",
    type_designation: "",
    genre_designation: "",
    totalKilo: "",
    designation_centre: "",
    designation_district: "",
  })
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch demande data
        const response = await fetch(`/api/intervention/constaterDemande`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_demande_intervention }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la récupération de la demande d'intervention")
        }

        const data = await response.json()
        setDemande(data)

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
    if (id_demande_intervention) {
      fetchData()
    } else {
      setError("Identifiant de demande manquant")
      setIsLoading(false)
    }
  }, [id_demande_intervention])

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">Erreur</p>
            <p className="text-gray-500 text-center mt-2">{error}</p>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }
  console.log(demande)
  console.log(vehiculeInfo)
  if (!demande) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-yellow-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-lg font-medium text-yellow-600">Aucune donnée</p>
            <p className="text-gray-500 text-center mt-2">Aucune demande d'intervention trouvée</p>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Parse nature_panne to get selected items
  const panneItems = demande.nature_panne ? demande.nature_panne.split("/") : []

  // Parse structure_maintenance to get type and detail
  let structure_type = ""
  let structure_detail = ""

  if (demande.structure_maintenance) {
    const parts = demande.structure_maintenance.split(",")
    structure_type = parts[0] || ""
    structure_detail = parts[1] || ""
  }

  return (
    <>
      <style jsx global>
        {printStyles}
      </style>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="date" content="no" />
      <div className="bg-white p-6 max-w-5xl mx-auto my-8 shadow-lg rounded-lg print:shadow-none print:p-0 print:m-0 print:max-w-none">
        <div className="print:hidden flex justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Retour
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Imprimer
          </button>
        </div>

        <div className="print-container">
          {/* Header */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-0 w-60 h-24">
                    <img src="/logo-naftal.png" alt="NAFTAL Logo" className="w-full h-full object-contain p-2" />
                  </th>
                  <th className="border-2 border-gray-800 px-7 py-5 w-140 text-2xl font-bold">
                    <h2>DEMANDE D&apos;INTERVENTION</h2>
                  </th>
                  <th className="border-2 border-gray-800  w-60">
                    <div className="border-b-2 border-gray-800  text-center font-semibold">ER.NAF.MNT.09.V2</div>
                    <div className="pt-2">
                      <div className="font-semibold">Date d&apos;application :</div>
                      <div className="text-center mt-1">
                        {demande.date_application
                          ? new Date(demande.date_application).toLocaleDateString("fr-FR")
                          : "Non spécifié"}
                      </div>
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
                  <td className="border-2 border-gray-800  w-1/3">
                    <span className="font-bold mb-1 px-1">N° :</span>
                    <span className="pl-2">{demande.numero_demande}</span>
                  </td>
                  <td className="border-2 border-gray-800 ">
                    <span className="font-bold mb-1 px-1">District/Autre :</span>
                    <span className="pl-2 text-sm">{vehiculeInfo?.designation_district || "Non spécifié"}</span>
                  </td>
                  <td className="border-2 border-gray-800 w-2/5" rowSpan={2}>
                    <h5 className="font-bold px-1">Structure Maintenance Destinataire</h5>
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structure_type === "cds"}
                          readOnly
                          className="form-checkbox h-4 w-4"
                        />
                        <span>CDS</span>
                        {structure_type === "cds" && structure_detail && (
                          <span className="pl-1 text-sm">{structure_detail}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structure_type === "garage"}
                          readOnly
                          className="form-checkbox h-4 w-4"
                        />
                        <span>Garage secondaire / Atelier Réseau</span>
                        {structure_type === "garage" && structure_detail && (
                          <span className="pl-1 text-sm">{structure_detail}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structure_type === "unm"}
                          readOnly
                          className="form-checkbox h-4 w-4"
                        />
                        <span>UNM / District</span>
                        {structure_type === "unm" && structure_detail && (
                          <span className="pl-1 text-sm">{structure_detail}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structure_type === "canalisation"}
                          readOnly
                          className="form-checkbox h-4 w-4"
                        />
                        <span>Unité canalisation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structure_type === "prestataire"}
                          readOnly
                          className="form-checkbox h-4 w-4"
                        />
                        <span>Prestataire externe</span>
                        {structure_type === "prestataire" && structure_detail && (
                          <span className="pl-1 text-sm">{structure_detail}</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800">
                    <div className="font-bold mb-1 px-1">Date Heure de la panne ou de l&apos;avarie :</div>
                    <div className="pl-2">
                      {demande.date_heure_panne
                        ? new Date(demande.date_heure_panne).toLocaleString("fr-FR")
                        : "Non spécifié"}
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 px-1">
                    <span className="font-bold mb-1">CDS/Autre :</span>
                    <span className="pl-2 text-sm">{vehiculeInfo?.designation_centre || "Non spécifié"}</span>
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
                  <td className="border-2 border-gray-800 w-1/2">
                    <h5 className="font-bold px-4">Activité :</h5>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.activite === "Maintenance Installation fixe"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Maintenance Installation fixe</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.activite === "Materiel roulant"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Matériel Roulant</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.activite === "Navire"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Navire</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.activite === "Autres"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Autres*</span>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800">
                    <h5 className="font-bold  px-4">Nature de la Panne :</h5>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={panneItems.includes("Mécanique")}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Mécanique</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={panneItems.includes("Électrique")}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Électrique</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={panneItems.includes("Autre")}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Autre*</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 ">
                    <h5 className="font-bold px-4">Nature des travaux :</h5>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Maintenance Corrective"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Maintenance Corrective</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Maintenance Preventive"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Maintenance Préventive</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Travaux Neufs"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Travaux Neufs</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Modification"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Modification</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Expertise"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Expertise</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Vérification Métrologique"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Vérification Métrologique</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.nature_travaux === "Contrôle réglementaire"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>Contrôle réglementaire</span>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-4">
                    <h5 className="font-bold">Degré d'urgence :</h5>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.degre_urgence === "1"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>(1)</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.degre_urgence === "2"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>(2)</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demande.degre_urgence === "3"}
                          readOnly
                          className="form-checkbox h-4 w-4 mr-2"
                        />
                        <span>(3)</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Vehicle Identification */}
          <div className="border-2 border-gray-800">
            <div className="bg-gray-100 border-b-2 border-gray-800">
              <h4 className="text-center font-bold">Identification du bien</h4>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 w-1/2">
                    <span className="font-bold">Code:</span>
                    <span className="pl-2 mt-1">{demande.code_vehicule}</span>
                  </td>
                  <td className="border-2 border-gray-800 ">
                    <span className="font-bold">Genre:</span>
                    <span className="pl-2 mt-1">{vehiculeInfo.genre_designation}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 ">
                    <span className="font-bold">Marque:</span>
                    <span className="pl-2 mt-1">{vehiculeInfo?.marque_designation}</span>
                  </td>
                  <td className="border-2 border-gray-800 ">
                    <span className="font-bold">Km et/ou Heures de fonctionnement:</span>
                    <span className="pl-2 mt-1">{vehiculeInfo.totalKilo}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 ">
                    <span className="font-bold">Type:</span>
                    <span className="pl-2 mt-1">{vehiculeInfo?.type_designation}</span>
                  </td>
                  <td className="border-2 border-gray-800 "></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Breakdown Description */}
          <div className="border-2 border-gray-800">
            <div className="bg-gray-100 border-b-2 border-gray-800 ">
              <h4 className="text-center font-bold">Constat de la panne</h4>
            </div>
            <div className="p-4 min-h-[200px]">
              {demande.constat_panne ? (
                <p className="whitespace-pre-line">{demande.constat_panne}</p>
              ) : (
                <p className="text-gray-400 italic">Aucun constat de panne renseigné</p>
              )}
            </div>
          </div>

          {/* Section 5: Signatures */}
          <div className="border-2 border-gray-800">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 px-3 w-1/2 bg-gray-100">
                    <h4 className="font-bold">Demandeur</h4>
                  </th>
                  <th className="border-2 border-gray-800 px-3 bg-gray-100">
                    <h4 className="font-bold">Responsable CDS Autres</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="">
                      <div>
                        <span className="font-bold text-sm">Nom & Prénom :</span>
                        <span className="pl-2 mt-1 text-sm">{demande.nom_prenom_demandeur}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Fonction :</span>
                        <span className="pl-2 mt-1 text-sm">{demande.fonction_demandeur}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Date :</span>
                        <span className="pl-2 mt-1 text-sm">
                          {demande.date_demandeur ? new Date(demande.date_demandeur).toLocaleDateString("fr-FR") : ""}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Visa :</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <div className="">
                      <div>
                        <span className="font-bold text-sm">Nom & Prénom :</span>
                        <span className="pl-2 mt-1 text-sm">{demande.nom_prenom_responsable}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Fonction :</span>
                        <span className="pl-2 mt-1 text-sm">{demande.fonction_responsable}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Date :</span>
                        <span className="pl-2 mt-1 text-sm">
                          {demande.date_responsable
                            ? new Date(demande.date_responsable).toLocaleDateString("fr-FR")
                            : ""}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Visa :</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*Qualification */}

          <div className="border-2 border-gray-800 ">
            <div className="bg-gray-100 border-b-2 border-gray-800 py-1">
              <h4 className="text-center font-bold text-sm">Qualification de l&apos;intervention</h4>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-2 w-1/3">
                    <div className="font-bold text-sm">Diagnostic Préliminaire :</div>
                    <div className="pl-2 min-h-[60px] text-sm">
                      {demande.diagnostique || <span className="text-gray-400 italic">Non renseigné</span>}
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-2 w-1/3">
                    <div className="font-bold text-sm">Description de la nature des travaux :</div>
                    <div className="pl-2 min-h-[60px] text-sm">
                      {demande.description || <span className="text-gray-400 italic">Non renseigné</span>}
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-2 w-24">
                    <div>
                      <div className="font-bold text-sm top-0">Niveaux de priorisation :</div>
                      <div className="space-y-1 pl-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={demande.niveaux_prio === "1"}
                            readOnly
                            className="form-checkbox h-3 w-3 mr-2"
                          />
                          <span className="text-sm">(1)</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={demande.niveaux_prio === "2"}
                            readOnly
                            className="form-checkbox h-3 w-3 mr-2"
                          />
                          <span className="text-sm">(2)</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={demande.niveaux_prio === "3"}
                            readOnly
                            className="form-checkbox h-3 w-3 mr-2"
                          />
                          <span className="text-sm">(3)</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="border-2 border-gray-800 p-2 w-1/3">
                    <div>
                      <div className="font-bold text-sm">Nécessitent-ils un permis de travail ? :</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={demande.necess_permis === true}
                          readOnly
                          className="form-checkbox h-3 w-3"
                        />
                        <span className="text-sm">Oui</span>
                        <input
                          type="checkbox"
                          checked={demande.necess_permis === false}
                          readOnly
                          className="form-checkbox h-3 w-3 ml-4"
                        />
                        <span className="text-sm">Non</span>
                      </div>

                      <div className="mt-1 pl-2">
                        <div className="text-sm">Si oui, s&apos;agit-il d&apos;un permis de travail ?</div>
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={demande.routinier === true}
                            readOnly
                            className="form-checkbox h-3 w-3 mr-2"
                          />
                          <div className="text-sm">Routinier - PT Réf : </div>
                          <div className="px-1">{demande.routinier_ref || ""}</div>
                        </div>
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={demande.dangereux === true}
                            readOnly
                            className="form-checkbox h-3 w-3 mr-2"
                          />
                          <span className="text-sm">Dangereux - PT Réf : </span>
                          <div className="px-1">{demande.dangereux_ref || ""}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1">
                      <span className="font-bold text-sm">Nom & Prénom :</span>
                      <span className="text-sm">{demande.nom_prenom_HSE || "Non renseigné"}</span>
                      <br />
                      <span className="font-bold text-sm mt-1">Fonction :</span>
                      <span className="text-sm">{demande.fonction_HSE || "Non renseigné"}</span>
                      <br />
                      <span className="font-bold text-sm mt-1">Date :</span>
                      <span className="text-sm">
                        {demande.date_HSE ? new Date(demande.date_HSE).toLocaleDateString("fr-FR") : "Non renseigné"}
                      </span>
                      <div className="font-bold text-sm mt-1">Visa HSE :</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*Intervenant et responsable */}
          <div className="border-2 border-gray-800 mb-2">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-2 w-1/2 bg-gray-100">
                    <h4 className="font-bold text-sm">Intervenant</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-2 bg-gray-100">
                    <h4 className="font-bold text-sm">Responsable CDS/UNM/Autre</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-2">
                    <div className="space-y-1">
                      <div>
                        <span className="font-bold text-sm">Nom & Prénom :</span>
                        <span className="pl-2 text-sm">{demande.nom_prenom_intervenant}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Fonction :</span>
                        <span className="pl-2 text-sm">{demande.fonction_intervenant}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Date :</span>
                        <span className="pl-2 text-sm">
                          {demande.date_intervevant
                            ? new Date(demande.date_intervevant).toLocaleDateString("fr-FR")
                            : "Non renseigné"}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Visa :</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-2">
                    <div className="space-y-1">
                      <div>
                        <span className="font-bold text-sm">Nom & Prénom :</span>
                        <span className="pl-2 text-sm">{demande.nom_prenom_responsable_unm}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Fonction :</span>
                        <span className="pl-2 text-sm">{demande.fonction_responsable_unm}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm">Date :</span>
                        <span className="pl-2 text-sm">
                          {demande.date_responsable_unm
                            ? new Date(demande.date_responsable_unm).toLocaleDateString("fr-FR")
                            : "Non renseigné"}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Visa :</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Footer */}

        <p>*: Centres médicaux sociaux (CMS), laboratoires d'analyse, imprimerie, informatique, etc...</p>
        <hr className="bg-black" />
        <div className="mt-6 text-xs text-black flex justify-evenly ">
          <span>Date d'édition : janvier 2023</span>
          <span>Propriété NAFTAL GPL - Reproduction interdite</span>
          <span>Page 1 sur 1</span>
        </div>
      </div>
    </>
  )
}
