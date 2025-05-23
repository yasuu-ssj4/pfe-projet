"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import type { TraveauxExterne } from "@/app/interfaces"

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
    
    .mb-3 {
      margin-bottom: 0.15rem !important;
    }
    
    .p-3 {
      padding: 0.3rem !important;
    }
    
    .p-2 {
      padding: 0.2rem !important;
    }
    
    .p-1 {
      padding: 0.1rem !important;
    }
    
    .space-y-3 > * + * {
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
    
    /* Hide any unnecessary elements when printing */
    .print:hidden {
      display: none !important;
    }
  }
`

type ConstaterRapportProps = {
  id_demande_intervention: string
}

type Rapport = {
  rapport: Rapport_Intervention
  TravauxInterne: {
    id_rapport: string
    id_travaille: number
    atelier_desc: string
    temps_alloue: number
    PDR_consommee: string
    cout_pdr: number
    reference_bc_bm_btm: string
  }[]
  TravauxExterne: TraveauxExterne[]
}

type Rapport_Intervention = {
  id_demande_intervention: string
  id_rapport_intervention: string
  structure_maintenance_en_charge_des_travaux: string
  date_application: Date
  date_debut_travaux: string
  date_fin_travaux: string
  date_panne: string | Date
  date_prise_charge: string
  duree_travaux: string
  district_id: string
  centre_id: string
  numero_OR: string
  description_essais: string
  essais: string
  reservation: string | null
  cout_total_traveaux_interne: number
  cout_total_traveaux_externe: number
  reference_documentée: string
  date_fin_permis: string
  nom_utilisateur: string
  date_utilisateur: Date
  nom_prenom_demandeur: string
  date_demandeur: string
  nom_prenom_responsable: string
  date_responsable: string
}
export default function ConstaterRapport({ id_demande_intervention }: ConstaterRapportProps){
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<Rapport| null>(null)
    useEffect(() => {
        const fetchData = async() => {
            setIsLoading(true)
            setError(null)
            try{
                // fetch rapport info
                const response = await fetch('/api/rapport/getRapport',{
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({id_demande_intervention}),
                }) 
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Erreur lors de la récupération du rapport d'intervention")
                }
                const data = await response.json()
                setData(data)
                
            } catch (err) {
                console.error("Error fetching rapport:", err)
                setError(err instanceof Error ? err.message : "Une erreur est survenue")
              } finally {
                setIsLoading(false)
              }
        }
        if(id_demande_intervention) {
            fetchData()
        } else {
            setError("Identifiant de rapport manquant")
            setIsLoading(false)
        }
    }, [id_demande_intervention])

    const handlePrint = () => {
        window.print()
      }
    
      const handleBack = () => {
        router.back()
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

      const calculateTempsInterne = () => {
        if (!data?.TravauxInterne || data.TravauxInterne.length === 0) return 0
        return data.TravauxInterne.reduce((total, item) => total + (item.temps_alloue || 0), 0)
      }

       // creation de ligne pour la table de travaux interne
  const createInternalRows = () => {
    const rows = []
    const internalWorks = data?.TravauxInterne || []

    // Always show 6 rows
    for (let i = 0; i < 6; i++) {
      if (i < internalWorks.length) {
        // Data row
        const item = internalWorks[i]
        rows.push(
          <tr key={`internal-${i}`} className="border border-gray-800">
            <td className="border border-gray-800 p-2"></td>
            <td className="border border-gray-800 p-2">{item.atelier_desc}</td>
            <td className="border border-gray-800 p-2 text-center">{item.temps_alloue}</td>
            <td className="border border-gray-800 p-2">{item.PDR_consommee}</td>
            <td className="border border-gray-800 p-2 text-right">{item.cout_pdr}</td>
            <td className="border border-gray-800 p-2">{item.reference_bc_bm_btm}</td>
          </tr>,
        )
      } else {
        // Empty row
        rows.push(
          <tr key={`empty-internal-${i}`} className="border border-gray-800">
            <td className="border border-gray-800 p-2">&nbsp;</td>
            <td className="border border-gray-800 p-2">&nbsp;</td>
            <td className="border border-gray-800 p-2">&nbsp;</td>
            <td className="border border-gray-800 p-2">&nbsp;</td>
            <td className="border border-gray-800 p-2">&nbsp;</td>
            <td className="border border-gray-800 p-2">&nbsp;</td>
          </tr>,
        )
      }
    }

    // Add additional rows if there are more than 6 items
    if (internalWorks.length > 6) {
      for (let i = 6; i < internalWorks.length; i++) {
        const item = internalWorks[i]
        rows.push(
          <tr key={`internal-extra-${i}`} className="border border-gray-800">
            <td className="border border-gray-800 p-1 text-xs"></td>
            <td className="border border-gray-800 p-1 text-xs">{item.atelier_desc}</td>
            <td className="border border-gray-800 p-1 text-xs text-center">{item.temps_alloue}</td>
            <td className="border border-gray-800 p-1 text-xs">{item.PDR_consommee}</td>
            <td className="border border-gray-800 p-1 text-xs text-right">{item.cout_pdr}</td>
            <td className="border border-gray-800 p-1 text-xs">{item.reference_bc_bm_btm}</td>
          </tr>,
        )
      }
    }

    return rows
  }

    // Create rows for external works table
    const createExternalRows = () => {
        const rows = []
        const externalWorks = data?.TravauxExterne || []
    
        // Always show 6 rows
        for (let i = 0; i < 6; i++) {
          if (i < externalWorks.length) {
            // Data row
            const item = externalWorks[i]
            rows.push(
              <tr key={`external-${i}`} className="border border-gray-800">
                <td className="border border-gray-800 p-2"></td>
                <td className="border border-gray-800 p-2">{item.design_prestataire}</td>
                <td className="border border-gray-800 p-2">{item.reference_contrat}</td>
                <td className="border border-gray-800 p-2">{item.reference_facture}</td>
                <td className="border border-gray-800 p-2 text-right">{item.cout_facture}</td>
              </tr>,
            )
          } else {
            // Empty row
            rows.push(
              <tr key={`empty-external-${i}`} className="border border-gray-800">
                <td className="border border-gray-800 p-2">&nbsp;</td>
                <td className="border border-gray-800 p-2">&nbsp;</td>
                <td className="border border-gray-800 p-2">&nbsp;</td>
                <td className="border border-gray-800 p-2">&nbsp;</td>
                <td className="border border-gray-800 p-2">&nbsp;</td>
              </tr>,
            )
          }
        }
    
        // Add additional rows if there are more than 6 items
        if (externalWorks.length > 6) {
          for (let i = 6; i < externalWorks.length; i++) {
            const item = externalWorks[i]
            rows.push(
              <tr key={`external-extra-${i}`} className="border border-gray-800">
                <td className="border border-gray-800 p-1 text-xs"></td>
                <td className="border border-gray-800 p-1 text-xs">{item.design_prestataire}</td>
                <td className="border border-gray-800 p-1 text-xs">{item.reference_contrat}</td>
                <td className="border border-gray-800 p-1 text-xs">{item.reference_facture}</td>
                <td className="border border-gray-800 p-1 text-xs text-right">{item.cout_facture}</td>
              </tr>,
            )
          }
        }
    
        return rows
      }
      // pour diviser la structure maintenance en charge en 2
      let structure_type = ""
      let structure_detail = ""
      if(data?.rapport.structure_maintenance_en_charge_des_travaux) {
        const parts = data.rapport.structure_maintenance_en_charge_des_travaux.split(',')
        structure_type = parts[0] || ''
        structure_detail = parts[1] || ''
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
      console.log(data)

      if(!data){
        return(
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-12 w-12 bg-yellow-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-lg font-medium text-yellow-600">Aucune donnée</p>
                  <p className="text-gray-500 text-center mt-2">Aucun rapport d'intervention trouvée</p>
                  <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Retour
                  </button>
                </div>
              </div>
            </div>
        )
      };
    
      return(
  <>
    <style jsx global>{printStyles}</style>
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
                        <h2>RAPPORT D'INTERVENTION</h2>
                      </th>
                      <th className="border-2 border-gray-800  w-60">
                        <div className="border-b-2 border-gray-800  text-center font-semibold">ER.NAF.MNT.20.V1</div>
                        <div className="pt-2">
                          <div className="font-semibold">Date d'application :</div>
                          <div className="text-center mt-1">
                            {data.rapport.date_application 
                              ? new Date(data.rapport.date_application).toLocaleDateString("fr-FR")
                              : "Non spécifié"}
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              {/*Section one rapport info */}
              <div >
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800">
                    <div className="flex flex-col">
                      <div className="flex items-start">
                        <span className="font-bold px-1">N° :</span>
                        <span className="pl-1">{data.rapport.id_rapport_intervention}</span>
                      </div>
                        <span className="font-bold px-1">Structure Maintenance en</span> 
                          <div className="px-1"> <b> charge des travaux : </b>{data.rapport.structure_maintenance_en_charge_des_travaux}</div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-1">
                  <div className="flex items-start">
                    <span className="font-bold px-1">DI N° :</span>
                    <span className="pl-1">{data.rapport.id_demande_intervention}</span>
                  </div>
                  </td>
                  <td className="border-2 border-gray-800 p-1 ">
                    <div className="font-bold text-center ">Appartenance du Bien</div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 px-1">
                    <div className="font-bold">Date et heure début des travaux :</div>
                    <div className="flex items-center">
                    <span className="font-bold">Le</span>
                    <span className="pl-1">{new Date(formatDateToInputValue(data.rapport.date_debut_travaux)).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold pl-1">à</span>
                    <span className="pl-1">{formatHeureToInputValue(data.rapport.date_debut_travaux)}</span>
                  </div>
                  </td>
                  <td className="border-2 border-gray-800 px-1">
                    <span className="font-bold">Date et Heure de la panne </span> 
                    <div className="font-bold">ou de l'avarie :</div>
                    <div className="flex items-center">
                    <span className="font-bold">Le</span>
                    <span className="pl-1">{new Date(formatDateToInputValue(data.rapport.date_panne)).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold pl-1">à</span>
                    <span className="pl-1">{formatHeureToInputValue(data.rapport.date_panne)}</span>
                  </div>
                  </td>
                  <td className="border-2 border-gray-800 p-1">
                    <div className="flex px-1">
                    <span className="font-bold">District / Autre:</span>
                    <span className="pl-1">{data.rapport.district_id}</span>
                  </div>
                  </td>
                </tr>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800">
                    <div className="font-bold px-1">Date et heure fin des travaux :</div>
                    <span className="font-bold px-1">Le</span>
                    <span className="pl-2">{new Date(formatDateToInputValue(data.rapport.date_fin_travaux)).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold px-1">à</span>
                    <span className="pl-2">{formatHeureToInputValue(data.rapport.date_fin_travaux)}</span>
                  </td>
                  <td className="border-2 border-gray-800 p-1">
                      <span className="font-bold mb-1 px-1">OR N° :</span>
                      <span className="pl-2">{data.rapport.numero_OR}</span>
                  </td>
                  <td rowSpan={2} className="border-2 border-gray-800 p-3">
                    <span className="font-bold mb-1 px-1">CDS/ Autre:</span>
                    <span className="pl-2">{data.rapport.centre_id}</span>
                  </td>
                </tr>
                <tr className="border-2 border-gray-800">
                  <td className="border-2 border-gray-800">
                    <div className="font-bold mb-1 px-1">Durée des travaux :</div>
                    <span className="pl-2">{data.rapport.duree_travaux}</span>
                  </td>
                  <td className="border-2 border-gray-800">
                    <div className="font-bold  px-1">Date et heure de prise en</div>
                    <div className="font-bold px-1">charge des travaux :</div>
                    <span className="font-bold  px-1">Le</span>
                    <span className="pl-2">{new Date(formatDateToInputValue(data.rapport.date_prise_charge)).toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold  px-1">à</span>
                    <span className="px-1">{formatHeureToInputValue(data.rapport.date_prise_charge)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            {/*Liste des travaux en interne */}
            <div className="border-2 border-gray-800 mb-3">
              <table className="w-full border-collapse ">
                <thead>
                  <tr>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/4">Liste des Travaux exécutés<br />En Interne</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/6">Atelier et/ou<br />Intervenant</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/12">Temps<br />alloué (h)</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/6">PDR<br />Consommée</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/8">Coût PDR</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/6">Référence<br />BC/BS/BTM</th>
                  </tr>
                </thead>
                <tbody>
                {createInternalRows()}
                <tr>
                    <td>Total :</td>
                    <td></td>
                    <td className="border border-l-gray-800">{calculateTempsInterne()}</td>
                    <td className="bg-black"></td>
                    <td>{data.rapport.cout_total_traveaux_interne}</td>
                    <td className="bg-black"></td>
                </tr>
                  </tbody>
                  </table>
                  </div>

            {/* Liste des travaux en externe */}
            <div className="border-2 border-gray-800 mb-3">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/3">Liste des travaux réalisés<br />en Externe</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/5">Désignation<br />du<br /> Prestataire</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/6">Référence<br />du Contrat et/ou<br />Bon commande</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/6">Référence<br />de la Facture</th>
                    <th className="border border-gray-800 p-2 bg-gray-100 w-1/5">Coût facturé</th>
                  </tr>
                </thead>
                <tbody>
                    {createExternalRows()}
                <tr>
                    <td>Total :</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="border border-l-gray-800">{data.rapport.cout_total_traveaux_externe}</td>
                </tr>
                </tbody>
                </table>
            </div>
            {/* Section essai et Tests */}
            <div className="border-2 border-gray-800 mb-6">
          <div className="border-b border-gray-800 p-1">
            <div className="text-center font-bold">Essais et Tests de fonctionnement</div>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-800 p-1 w-3/5">
                  <span className="font-semibold">Nature des Essais et/ou tests de fonctionnement réalisés (Description sommaire) :</span>
                  <span className="pl-1 min-h-[40px]">{data.rapport.description_essais}</span>
                </td>
                <td className="border border-gray-800 p-1 w-2/5">
                  <span className="font-semibold">Essais et/ou tests concluants ? :</span>
                  <span className="flex gap-4 mt-1">
                    <span className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.rapport.essais === "oui"}
                        readOnly
                        className="mr-1 h-3 w-3"
                      />
                      <span>Oui</span>
                    </span>
                    <span className="flex items-center">
                      
                      <input
                        type="checkbox"
                        checked={data.rapport.essais === "non"}
                        readOnly
                        className="mr-1 h-3 w-3"
                      />
                      <span>Non</span>
                    </span>
                  </span>
                  <div className="mt-2">
                    <div className="font-semibold">Si non, Réserves :</div>
                    <div className="pl-1 min-h-[20px]">{data.rapport.reservation || ""}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-1">
                  <span className="font-semibold">La Référence(s) documentée(s) :</span>
                  <span className="pl-1">{data.rapport.reference_documentée}</span>
                </td>
                <td className="border border-gray-800 p-1">
                  <div className="font-semibold">Date fin permis de travail :</div>
                  <div className="pl-1">{data.rapport.date_fin_permis}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

          {/* Section 5: Signatures */}
          <div className="border-2 border-gray-800 mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Etabli par :</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Vérifié par :</h4>
                  </th>
                  <th className="border-2 border-gray-800 p-3 bg-gray-100">
                    <h4 className="font-bold">Validé par :</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Intervenant :</h5>
                    <div className="space-y-3">
                      <div>
                        <span className=" text-sm font-medium mb-1">Nom et Prénom :</span>
                        <span>{data.rapport.nom_utilisateur}</span>
                      </div>
                      <div>
                        <span className=" text-sm font-medium mb-1">Date :</span>
                        <span className="px-3">
                        {data.rapport.date_utilisateur
                              ? new Date(data.rapport.date_utilisateur).toLocaleDateString("fr-FR")
                              : "Non spécifié"}
                        </span>
                      </div>
                      <div>
                        <span className=" text-sm font-medium mb-1">Visa :</span>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Responsable Maintenance :</h5>
                    <div className="space-y-3">
                      <div>
                      <span className="text-sm font-medium mb-1">Nom et Prénom :</span>
                      <span>{data.rapport.nom_prenom_responsable}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium mb-1">Date :</span>
                        <span>{new Date(data.rapport.date_responsable).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium mb-1">Visa :</span>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    <h5 className="font-semibold mb-2">Demandeur :</h5>
                    <div className="space-y-3">
                      <div>
                      <span className="text-sm font-medium mb-1">Nom et Prénom :</span>
                      <span>{data.rapport.nom_prenom_demandeur}</span>
                      </div>
                      <div>
                      <span className="text-sm font-medium mb-1">Date :</span>
                      <span>{new Date(data.rapport.date_demandeur).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1">Visa :</label>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>          
          </div>
            </div>
            </div>
        </>
      )
}
