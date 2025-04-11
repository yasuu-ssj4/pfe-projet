// app/(intervention)/maintenance2/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormData } from "../../components/FormContext";


 const stepss = ["Étape 1", "Étape 2", "Étape 3", "Étape 4"];

export default function Maintenance2() {
  const { formData, updateField } = useFormData();
  const [error, setError] = useState(false);
  const router = useRouter();
   const stepp = 1; // Pour affichage barre progression

  const handleNext = () => {
    if (
      !formData.natureTravauxDesc ||
      formData.natureTravauxDesc.trim() === ""
    ) {
      setError(true);
      return;
    }
    setError(false);
    router.push("/maintenance3"); 
  };

  const handlePrevious = () => {
     
    router.push("/maintenance1");  
  };

  return (
    <div className="p-6 flex flex-col gap-6 text-gray-800">
      <div className=" bg-white p-6 rounded-2xl shadow-md  ">
        {" "}
        {/* Centrage */}
        {/* Barre de progression optionnelle */}
        <div className="progress-bar1 mb-4">
          {stepss.map((label, index) => (
            <div
              key={index}
              className={`stepp inline-block mr-2 ${
                index === stepp
                  ? "border-b-blue-800 border-b-4 p-3 font-bold text-blue-800"
                  : index < stepp
                  ? "text-green-500 text-sm font-semibold p-1 rounded-sm bg-green-100"
                  : "text-gray-600 text-sm"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {" "}
          {/* Ajout espacement */}
          <label
            htmlFor="natureTravauxDesc"
            className="block text-md font-medium text-yellow-600 mb-2    "
          >
            Description de la nature des travaux :
          </label>
          <textarea
            id="natureTravauxDesc"
            className="input w-full min-h-[120px]  border border-gray-300 rounded-md px-3 py-1 text-sm flex-1" // Style textarea
            value={formData.natureTravauxDesc || ""}
            placeholder="Décrivez ici la nature des travaux..."
            onChange={(e) => {
              updateField("natureTravauxDesc", e.target.value);
              if (e.target.value.trim() !== "") {
                setError(false);
              }
            }}
          ></textarea>
          {error && (
            <p className="text-red-500 text-sm mt-1">
              Veuillez remplir la description pour continuer.
            </p>
          )}
        </div>
        <div className="flex justify-between mt-8">
          <button
            className=" bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition" // Style Précédent
            onClick={handlePrevious}
          >
            Précédent
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            onClick={handleNext}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
