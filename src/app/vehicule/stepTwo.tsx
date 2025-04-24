"use client"
import type React from "react"
import type { VehicleForm } from "./formVehicules"
import { CalendarIcon } from "lucide-react"

type StepTwoProps = {
  FormValue: VehicleForm
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  SetStep: React.Dispatch<React.SetStateAction<number>>
  SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>
}

const StepTwo: React.FC<StepTwoProps> = ({ FormValue, handleChange, SetStep, SetFormValue }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="code_vehicule" className="block text-sm font-medium text-gray-700 mb-1">
            Code du véhicule
          </label>
          <input
            id="code_vehicule"
            name="code_vehicule"
            onChange={handleChange}
            value={FormValue.code_vehicule}
            placeholder="Code du véhicule"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="n_immatriculation" className="block text-sm font-medium text-gray-700 mb-1">
            Matricule
          </label>
          <input
            id="n_immatriculation"
            name="n_immatriculation"
            onChange={handleChange}
            value={FormValue.n_immatriculation}
            placeholder="Matricule du véhicule"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="n_serie" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de série
          </label>
          <input
            id="n_serie"
            name="n_serie"
            onChange={handleChange}
            value={FormValue.n_serie}
            placeholder="N° série"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="n_inventaire" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro inventaire
          </label>
          <input
            id="n_inventaire"
            name="n_inventaire"
            onChange={handleChange}
            value={FormValue.n_inventaire}
            placeholder="N° inventaire"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="prix_acquisition" className="block text-sm font-medium text-gray-700 mb-1">
            Prix d'acquisition
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">DA</span>
            </div>
            <input
              id="prix_acquisition"
              name="prix_acquisition"
              type="number"
              min={1}
              onChange={(e) =>
                SetFormValue({
                  ...FormValue,
                  prix_acquisition: e.target.value === "" ? null : Number.parseFloat(e.target.value),
                })
              }
              value={FormValue.prix_acquisition ?? ""}
              placeholder="Prix"
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date_acquisition" className="block text-sm font-medium text-gray-700 mb-1">
            Date d'acquisition
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="date_acquisition"
              name="date_acquisition"
              type="date"
              value={FormValue.date_acquisition ?? ""}
              onChange={(e) => SetFormValue({ ...FormValue, date_acquisition: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => SetStep(1)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => SetStep(3)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default StepTwo
