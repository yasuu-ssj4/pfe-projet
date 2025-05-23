"use client"
import type React from "react"
import type { VehicleForm } from "./formVehicules"
import { ChevronDownIcon } from "lucide-react"

type StepThreeProps = {
  FormValue: VehicleForm
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  SetStep: React.Dispatch<React.SetStateAction<number>>
  SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>
}

const StepThree: React.FC<StepThreeProps> = ({ FormValue, handleChange, SetStep, SetFormValue }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="unite_predication" className="block text-sm font-medium text-gray-700 mb-1">
            Unité de prédication
          </label>
          <div className="relative">
            <select
              id="unite_predication"
              name="unite_predication"
              onChange={handleChange}
              value={FormValue.unite_predication}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option>Kilometrage</option>
              <option>Heure de fonctionnement</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="kilo_parcouru_heure_fonctionnement" className="block text-sm font-medium text-gray-700 mb-1">
            {FormValue.unite_predication === "Kilometrage"
              ? "Nombre de kilomètres parcourus"
              : "Nombre d'heures de fonctionnement"}
          </label>
          <input
            id="kilo_parcouru_heure_fonctionnement"
            name="kilo_parcouru_heure_fonctionnement"
            value={FormValue.kilo_parcouru_heure_fonctionnement}
            onChange={(e) => {
              const value = e.target.value
              SetFormValue({
                ...FormValue,
                kilo_parcouru_heure_fonctionnement:
                  value.trim() !== "" && !isNaN(Number(value)) ? Number.parseFloat(value) : "",
              })
            }}
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="code_status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut du véhicule
          </label>
          <div className="relative">
            <select
              id="code_status"
              name="code_status"
              onChange={handleChange}
              value={FormValue.code_status}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="OPR">OPR - Opérationnel</option>
              <option value="IMB">IMB - Immobilisé</option>
              <option value="IRF">IRF - Irréformable</option>
              <option value="PRF">PRF - Préréformé</option>
              <option value="RFD">RFD - Réformé définitif</option>
              <option value="LIQ">LIQ - Liquidé</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(2)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => SetStep(4)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default StepThree
