"use client"
import type { VehicleForm } from "./formVehicules"
import type React from "react"

import { CalendarIcon, LoaderIcon } from "lucide-react"
import { useState } from "react"

type StepFourProps = {
  FormValue: VehicleForm
  SetStep: React.Dispatch<React.SetStateAction<number>>
  SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>
}

const StepFour: React.FC<StepFourProps> = ({ FormValue, SetStep, SetFormValue }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    SetFormValue({ ...FormValue, [name]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Documents de bord</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assurance */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Assurance</h4>
          <div>
            <label htmlFor="date_debut_assurance" className="block text-sm font-medium text-gray-700 mb-1">
              Date début assurance
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_debut_assurance"
                name="date_debut_assurance"
                type="date"
                value={FormValue.date_debut_assurance ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_assurance" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin assurance
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_fin_assurance"
                name="date_fin_assurance"
                type="date"
                value={FormValue.date_fin_assurance ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contrôle technique */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Contrôle technique</h4>
          <div>
            <label htmlFor="date_debut_controle_technique" className="block text-sm font-medium text-gray-700 mb-1">
              Date début contrôle technique
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_debut_controle_technique"
                name="date_debut_controle_technique"
                type="date"
                value={FormValue.date_debut_controle_technique ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_controle_technique" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin contrôle technique
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_fin_controle_technique"
                name="date_fin_controle_technique"
                type="date"
                value={FormValue.date_fin_controle_technique ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Permis de circuler */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Permis de circuler</h4>
          <div>
            <label htmlFor="date_debut_permis_circuler" className="block text-sm font-medium text-gray-700 mb-1">
              Date début du permis de circuler
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_debut_permis_circuler"
                name="date_debut_permis_circuler"
                type="date"
                value={FormValue.date_debut_permis_circuler ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_permis_circuler" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin du permis de circuler
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_fin_permis_circuler"
                name="date_fin_permis_circuler"
                type="date"
                value={FormValue.date_fin_permis_circuler ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ATMD */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Transport de matériel dangereux</h4>
          <div>
            <label htmlFor="date_debut_atmd" className="block text-sm font-medium text-gray-700 mb-1">
              Date début ATMD
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_debut_atmd"
                name="date_debut_atmd"
                type="date"
                value={FormValue.date_debut_atmd ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin_atmd" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin ATMD
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date_fin_atmd"
                name="date_fin_atmd"
                type="date"
                value={FormValue.date_fin_atmd ?? ""}
                onChange={handleDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificat conditionnel */}
      {["F", "S", "E", "R"].includes(FormValue.code_genre) && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">
            {["F", "S"].includes(FormValue.code_genre) ? "Certificat réepreuve" : "Certificat baremage"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date_debut_certificat" className="block text-sm font-medium text-gray-700 mb-1">
                Date début certificat
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date_debut_certificat"
                  name="date_debut_certificat"
                  type="date"
                  value={FormValue.date_debut_certificat ?? ""}
                  onChange={handleDate}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="date_fin_certificat" className="block text-sm font-medium text-gray-700 mb-1">
                Date fin certificat
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date_fin_certificat"
                  name="date_fin_certificat"
                  type="date"
                  value={FormValue.date_fin_certificat ?? ""}
                  onChange={handleDate}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(3)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoaderIcon className="inline-block w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Confirmer"
          )}
        </button>
      </div>
    </div>
  )
}

export default StepFour
