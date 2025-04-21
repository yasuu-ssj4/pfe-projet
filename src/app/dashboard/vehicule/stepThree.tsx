"use client";
import React from "react";
import { VehicleForm } from "./formVehicules";
type StepThreeProps = {
    FormValue: VehicleForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>;
}

const StepThree: React.FC<StepThreeProps> = ({ FormValue, handleChange, SetStep, SetFormValue }) => {
    return(
    <div className="bg-[#f2f2f2] p-6  rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
        <div className="grid grid-cols-2">
           <label htmlFor="unite_predication">Unite de predication</label>
           <select
           id="unite_predication"
           name="unite_predication"
           onChange={handleChange}
           value={FormValue.unite_predication}>
              <option>Kilometrage</option>
              <option>Heure de fonctionnement</option>
           </select>
           <label htmlFor="kilo_parcouru_heure_fonctionnement">Nombre de kilomÃ©trage ou d'heure de fonctionnement</label>
           <input
           id="kilo_parcouru_heure_fonctionnement"
           name="kilo_parcouru_heure_fonctionnement"
           value={FormValue.kilo_parcouru_heure_fonctionnement}
           onChange={(e) =>{
            const value = e.target.value
            SetFormValue({
              ...FormValue,
              kilo_parcouru_heure_fonctionnement
                : value.trim() !== "" && !isNaN(Number(value))
                ? parseFloat(value)
                : ""
            })}}
           type="number"
           className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
           />
           <label htmlFor="code_status">Status du vehicule</label>
           <select
           id="code_status"
           name="code_status"
           onChange={handleChange}
           value={FormValue.code_status}>
              <option>OPR</option>
              <option>IMB</option>
              <option>IRF</option>
              <option>PRF</option>
              <option>RFD</option>
              <option>LIQ</option>
           </select>
        </div>
        <div className="flex justify-end mt-10 space-x-4">
            <button
            type="button"
          onClick = {() => SetStep(2)} 
          className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">
           Retourner</button>
          <button
           onClick={() => SetStep(4)} 
           className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
          >Suivant</button>
          </div>
      </div>
    );
}
export default StepThree
