"use client";
import React from "react";
import { VehicleForm } from "./formVehicules";
import StepOne from "./stepOne";
type StepTwoProps = {
    FormValue: VehicleForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>;

}
const StepTwo: React.FC<StepTwoProps> = ({ FormValue, handleChange, SetStep, SetFormValue }) => {
    return(
            <div className="bg-[#f2f2f2] p-6  rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
               <div className="grid grid-cols-2">
                    <label htmlFor="code_vehicule">Code du vehicule</label>
                    <input
                    id="code_vehicule"
                    name="code_vehicule"
                    onChange={handleChange}
                    value={FormValue.code_vehicule}
                    placeholder="Code du vehicule"
                    className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                    />
                   <label htmlFor="n_immatriculation">Matricule</label>
                   <input
                   id="n_immatriculation"
                   name="n_immatriculation"
                   onChange={handleChange}
                   value={FormValue.n_immatriculation}
                   placeholder="Matricule du vehicule"
                   className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                   />
                   <label htmlFor="n_serie">Numero de serie</label>
                   <input
                   id="n_serie"
                   name="n_serie"
                   onChange={handleChange}
                   value={FormValue.n_serie}
                   placeholder="N serie"
                   className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                   />
                   <label htmlFor="n_inventaire">Numero inventaire</label>
                   <input
                   id="n_inventaire"
                   name="n_inventaire"
                   onChange={handleChange}
                   value={FormValue.n_inventaire}
                   placeholder="N inventaire"
                   className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                   />
                   <label htmlFor="prix_acquisition">Prix d'acquisition</label>
                   <input
                   id="prix_acquisition"
                   name="prix_acquisition"
                   type="number"
                   min={1}
                   onChange={(e) =>
                    SetFormValue({
                      ...FormValue,
                      prix_acquisition: e.target.value === ""
                        ? null
                        : parseFloat(e.target.value)
                    })}
                   value={FormValue.prix_acquisition ?? ""}
                   placeholder="Prix"
                   className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                   />
                     <label htmlFor="date_acquisition">Date d'acquisition</label>
                   <input
                   id="date_acquisition"
                   name="date_acquisition"
                   type="date"
                   value={FormValue.date_acquisition ?? ""}
                   onChange={(e) =>
                    SetFormValue({ ...FormValue, date_acquisition: e.target.value })
                  }
                   />
               </div>
               <div className="flex justify-end mt-10 space-x-4">
                <button
                type="button"
              onClick = {() => SetStep(1)} 
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">
               Retourner</button>
              <button
               onClick={() => SetStep(3)} 
               className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
              >Suivant</button>
              </div>
          </div>
    );
}
export default StepTwo;