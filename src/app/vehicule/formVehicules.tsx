"use client"
import { useState } from "react"
import type React from "react"

import StepOne from "./stepOne"
import StepTwo from "./stepTwo"
import StepThree from "./stepThree"
import StepFour from "./stepFour"
import type { Vehicule } from "@/app/interfaces"
import { AlertCircleIcon, CheckIcon, LoaderIcon, PlusIcon, XIcon } from "lucide-react"

//NE MODIFIE PAS CETTE INTERFACE ELLE EST IMPORTANTE POUR QUE LE FORM S ENVOIE DANS LE BON TYPE
export interface VehicleForm {
  code_vehicule: string
  code_genre: string
  code_marque: number
  code_type: number
  unite_predication: string
  kilo_parcouru_heure_fonctionnement: number | string
  code_status: string
  code_structure: string
  n_immatriculation: string
  n_serie: string
  date_acquisition: string
  prix_acquisition: number | null
  n_inventaire: string
  date_debut_assurance: string | null
  date_fin_assurance: string | null
  date_debut_controle_technique: string | null
  date_fin_controle_technique: string | null
  date_debut_atmd: string | null
  date_fin_atmd: string | null
  date_debut_permis_circuler: string | null
  date_fin_permis_circuler: string | null
  date_debut_certificat: string | null
  date_fin_certificat: string | null
}

export default function FormVehicule({userPrivs} : {userPrivs: string[]}) {
  const [popup, setPopup] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formValue, setFormValue] = useState<VehicleForm>({
    code_vehicule: "",
    code_genre: "A",
    code_marque: 1,
    code_type: 1,
    unite_predication: "Kilometrage",
    kilo_parcouru_heure_fonctionnement: 0,
    code_status: "OPR",
    code_structure: "",
    n_immatriculation: "",
    n_serie: "",
    date_acquisition: "",
    prix_acquisition: null,
    n_inventaire: "",
    date_debut_assurance: "",
    date_fin_assurance: "",
    date_debut_controle_technique: "",
    date_fin_controle_technique: "",
    date_debut_atmd: "",
    date_fin_atmd: "",
    date_debut_permis_circuler: "",
    date_fin_permis_circuler: "",
    date_debut_certificat: "",
    date_fin_certificat: "",
  })

  //fonction pour rendre les dates en dd/mm/yyyy
  function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  //fonction pour rendre les dates de type string a Date
  function cleanAndConvert<T extends Record<string, any>>(
    data: T,
    dateKeys: (keyof T)[],
    formatDates = false,
  ): { [K in keyof T]: T[K] | null | Date | string } {
    const cleaned = {} as { [K in keyof T]: T[K] | null | Date | string }

    for (const key in data) {
      const value = data[key]

      if (value === "") {
        cleaned[key] = null
        continue
      }

      if (dateKeys.includes(key)) {
        const dateObj = new Date(value)
        if (!isNaN(dateObj.getTime())) {
          cleaned[key] = formatDates ? formatDateDDMMYYYY(dateObj) : dateObj
          continue
        }
      }

      cleaned[key] = value
    }

    return cleaned
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openPopup = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFormValue({
      code_vehicule: "",
      code_genre: "A",
      code_marque: formValue.code_marque,
      code_type: formValue.code_type,
      unite_predication: "Kilometrage",
      kilo_parcouru_heure_fonctionnement: 0,
      code_status: "OPR",
      code_structure: "",
      n_immatriculation: "",
      n_serie: "",
      date_acquisition: "",
      prix_acquisition: 0,
      n_inventaire: "",
      date_debut_assurance: "",
      date_fin_assurance: "",
      date_debut_controle_technique: "",
      date_fin_controle_technique: "",
      date_debut_atmd: "",
      date_fin_atmd: "",
      date_debut_permis_circuler: "",
      date_fin_permis_circuler: "",
      date_debut_certificat: "",
      date_fin_certificat: "",
    })
    setPopup(true)
    setStep(1)
    setError(null)
    setSuccess(null)
  }

  //fonction pour le submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const cleanedForm = cleanAndConvert(
        formValue,
        [
          "date_debut_assurance",
          "date_fin_assurance",
          "date_debut_permis_circuler",
          "date_fin_permis_circuler",
          "date_debut_controle_technique",
          "date_fin_controle_technique",
          "date_debut_atmd",
          "date_fin_atmd",
          "date_debut_certificat",
          "date_fin_certificat",
          "date_acquisition",
        ],
        false,
      )

      const testVehicule: Vehicule = {
        code_vehicule: formValue.code_vehicule,
        code_genre: formValue.code_genre,
        code_type: Number(formValue.code_type),
        unite_predication: formValue.unite_predication,
        n_immatriculation: formValue.n_immatriculation,
        n_serie: formValue.n_serie,
        prix_acquisition: formValue.prix_acquisition,
        n_inventaire: formValue.n_inventaire,
        date_acquisition:
          cleanedForm.date_acquisition instanceof Date
            ? cleanedForm.date_acquisition
            : cleanedForm.date_acquisition
              ? new Date(cleanedForm.date_acquisition)
              : null,
        date_debut_assurance:
          cleanedForm.date_debut_assurance instanceof Date
            ? cleanedForm.date_debut_assurance
            : cleanedForm.date_debut_assurance
              ? new Date(cleanedForm.date_debut_assurance)
              : null,
        date_fin_assurance:
          cleanedForm.date_fin_assurance instanceof Date
            ? cleanedForm.date_fin_assurance
            : cleanedForm.date_fin_assurance
              ? new Date(cleanedForm.date_fin_assurance)
              : null,
        date_debut_controle_technique:
          cleanedForm.date_debut_controle_technique instanceof Date
            ? cleanedForm.date_debut_controle_technique
            : cleanedForm.date_debut_controle_technique
              ? new Date(cleanedForm.date_debut_controle_technique)
              : null,
        date_fin_controle_technique:
          cleanedForm.date_fin_controle_technique instanceof Date
            ? cleanedForm.date_fin_controle_technique
            : cleanedForm.date_fin_controle_technique
              ? new Date(cleanedForm.date_fin_controle_technique)
              : null,
        date_debut_atmd:
          cleanedForm.date_debut_atmd instanceof Date
            ? cleanedForm.date_debut_atmd
            : cleanedForm.date_debut_atmd
              ? new Date(cleanedForm.date_debut_atmd)
              : null,
        date_fin_atmd:
          cleanedForm.date_fin_atmd instanceof Date
            ? cleanedForm.date_fin_atmd
            : cleanedForm.date_fin_atmd
              ? new Date(cleanedForm.date_fin_atmd)
              : null,
        date_debut_permis_circuler:
          cleanedForm.date_debut_permis_circuler instanceof Date
            ? cleanedForm.date_debut_permis_circuler
            : cleanedForm.date_debut_permis_circuler
              ? new Date(cleanedForm.date_debut_permis_circuler)
              : null,
        date_fin_permis_circuler:
          cleanedForm.date_fin_permis_circuler instanceof Date
            ? cleanedForm.date_fin_permis_circuler
            : cleanedForm.date_fin_permis_circuler
              ? new Date(cleanedForm.date_fin_permis_circuler)
              : null,
        date_debut_certificat:
          cleanedForm.date_debut_certificat instanceof Date
            ? cleanedForm.date_debut_certificat
            : cleanedForm.date_debut_certificat
              ? new Date(cleanedForm.date_debut_certificat)
              : null,
        date_fin_certificat:
          cleanedForm.date_fin_certificat instanceof Date
            ? cleanedForm.date_fin_certificat
            : cleanedForm.date_fin_certificat
              ? new Date(cleanedForm.date_fin_certificat)
              : null,
      }

      const affectation = {
        code_vehicule: formValue.code_vehicule,
        code_structure: formValue.code_structure,
      }

      const affecterstatus = {
        code_vehicule: formValue.code_vehicule,
        code_status: formValue.code_status,
      }

      console.log("testVehicule", testVehicule)
      console.log("affectation", affectation)
      console.log("affecterstatus", affecterstatus)

      // 1. Add vehicle
      const response = await fetch("http://localhost:3000/api/vehicule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testVehicule),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur serveur ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Succès:", data)

      // 2. Add affectation
      const affectationResponse = await fetch("http://localhost:3000/api/vehicule/affectation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(affectation),
      })

      if (!affectationResponse.ok) {
        const errorText = await affectationResponse.text()
        throw new Error(`Erreur d'affectation ${affectationResponse.status}: ${errorText}`)
      }

      const affectationData = await affectationResponse.json()
      console.log("Succès de l'affectation:", affectationData)

      // 3. Add status
      const affecterStatusResponse = await fetch("/api/vehicule/status/affecterStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(affecterstatus),
      })

      if (!affecterStatusResponse.ok) {
        const errorText = await affecterStatusResponse.text()
        throw new Error(`Erreur d'affectation de statut ${affecterStatusResponse.status}: ${errorText}`)
      }

 
      //ajouter l'historique de kilometrage 
      const historiqueKilometrage = {
        code_vehicule: formValue.code_vehicule,
        kilo_parcouru_heure_fonctionnement: formValue.kilo_parcouru_heure_fonctionnement,
      }
      const historiqueResponse = await fetch("/api/vehicule/kilometrage-heure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historiqueKilometrage),
      }) 
      
      if (!historiqueResponse.ok) {
        const errorText = await historiqueResponse.text()
        throw new Error(`Erreur d'historique de kilométrage ${historiqueResponse.status}: ${errorText}`)
      }
   
       
      setSuccess("Véhicule ajouté avec succès!")
      setTimeout(() => {
        setPopup(false)
        setSuccess(null)
      }, 2000)
 
      return data

    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {userPrivs.includes('ajout_vehicule') &&(
      <button
        onClick={openPopup}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Ajouter un véhicule</span>
      </button>)}

      {/* Alert for success */}
      {success && (
        <div className="fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg bg-green-500 text-white">
          <CheckIcon className="w-5 h-5 mr-2" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-3 text-white hover:text-gray-200">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 md:mx-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {step === 1 && "Informations générales"}
                {step === 2 && "Détails du véhicule"}
                {step === 3 && "État et statut"}
                {step === 4 && "Documents de bord"}
              </h2>
              <button onClick={() => setPopup(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={step >= 1 ? "text-indigo-600 font-medium" : ""}>Étape 1</span>
                <span className={step >= 2 ? "text-indigo-600 font-medium" : ""}>Étape 2</span>
                <span className={step >= 3 ? "text-indigo-600 font-medium" : ""}>Étape 3</span>
                <span className={step >= 4 ? "text-indigo-600 font-medium" : ""}>Étape 4</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              {step === 1 && (
                <StepOne FormValue={formValue} handleChange={handleChange} SetStep={setStep} SetPopup={setPopup} />
              )}
              {step === 2 && (
                <StepTwo
                  FormValue={formValue}
                  handleChange={handleChange}
                  SetStep={setStep}
                  SetFormValue={setFormValue}
                />
              )}
              {step === 3 && (
                <StepThree
                  FormValue={formValue}
                  handleChange={handleChange}
                  SetStep={setStep}
                  SetFormValue={setFormValue}
                />
              )}
              {step === 4 && (
                <div>
                  <StepFour FormValue={formValue} SetStep={setStep} SetFormValue={setFormValue} />

                  {/* Submit button is handled in StepFour */}
                  {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
                        <LoaderIcon className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-lg font-medium">Enregistrement en cours...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
