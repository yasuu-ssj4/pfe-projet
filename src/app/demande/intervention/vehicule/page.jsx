// app/(intervention)/vehicule/page.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormData } from "../../components/FormContext";  
export default function VehiculePage() {
  const router = useRouter();
 
  const { formData, updateMultipleFields } = useFormData();

  useEffect(() => {
    
    const fetchVehiculeData = () => {
      console.log("Simulating fetch for vehicle data...");  
      const simulatedData = {
        code: "V123",
        marque: "Toyota",
        type: "4x4",
        genre: "SUV",
        km: "120000", 
      };
 
      const dataToUpdate = {
        code: simulatedData.code,
        marque: simulatedData.marque,
        type: simulatedData.type,
        genre: simulatedData.genre,
        kmHeures: simulatedData.km,  
      };
 
      updateMultipleFields(dataToUpdate);
    };

 
    if (!formData.code) {
      fetchVehiculeData();
    }
  }, [updateMultipleFields, formData.code]);  

  const handleNext = () => {
    
    if (!formData.code || !formData.marque) {
      alert(
        "Les données du véhicule ne semblent pas chargées. Veuillez réessayer."
      );
      return;
    }
    router.push("/maintenance1");  
  };

  

  return (
    <div className="p-6 flex flex-col gap-6 text-gray-800">
      <div className="p-6 bg-white shadow-md rounded-xl  w-full max-w-2xl mx-auto lg:mt-10">
        <h3 className="text-xl font-bold text-blue-800 mb-6 text-center">
        Informations Véhicule
        </h3>
        {/* Affichage des données depuis formData */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Code :
            </label>
            <input
              type="text"
              id="code"
              value={formData.code || ""}
              readOnly
              className="input bg-gray-100 w-full px-2 py-1"
            />
          </div>
          <div>
            <label
              htmlFor="marque"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Marque :
            </label>
            <input
              type="text"
              id="marque"
              value={formData.marque || ""}
              readOnly
              className="input bg-gray-100 w-full px-2 py-1"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type :
            </label>
            <input
              type="text"
              id="type"
              value={formData.type || ""}
              readOnly 
              className="input bg-gray-100 w-full px-2 py-1"
            />
          </div>
          <div>
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Genre :
            </label>
            <input
              type="text"
              id="genre"
              value={formData.genre || ""}
              readOnly
              className="input bg-gray-100 w-full px-2 py-1"
            />
          </div>
          <div>
            <label
              htmlFor="kmHeures"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Km et/ou Heure de fonctionnement :
            </label>
            <input
              type="text"
              id="kmHeures"
              value={formData.kmHeures || ""}
              readOnly
              className="input bg-gray-100 w-full px-2 py-1"
            />
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8">
           
          <button
            id="SUIVAN"  
            onClick={handleNext}
            className= "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
