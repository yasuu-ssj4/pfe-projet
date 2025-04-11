// app/(intervention)/page2/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormData } from "../../components/FormContext";

const stepss = ["Étape 1", "Étape 2", "Étape 3", "Étape 4"];  

export default function Maintenance4() {
  // Renommée pour clarté (Constat Panne)
  const { formData, updateField } = useFormData();
  const [error, setError] = useState("");
  const router = useRouter();
   const [stepp] = useState(3); 

  const handlePrevious = () => {
    router.push("/maintenance3");  
  };

  const handleNext = () => {
    if (!formData.constatPanne || formData.constatPanne.trim() === "") {
      setError("Ce champ est obligatoire.");
      return;
    }
    setError("");
    router.push("/constatFinal");  
  };

  return (
    <div className="p-6 flex flex-col gap-6 text-gray-800">
      <div className=" bg-white p-6 rounded-2xl shadow-md  ">
        {" "}
        {/* Centrage */}
 
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
            htmlFor="constatPanne"
            className="block text-md font-medium   text-yellow-600 mb-2 "
          >
            Constat de la panne :
          </label>
          <textarea
            id="constatPanne"
            className="input w-full min-h-[150px]   border border-gray-300 rounded-md px-3 py-1 text-sm flex-1" // Hauteur plus grande
            onChange={(e) => {
              updateField("constatPanne", e.target.value);
              if (e.target.value.trim() !== "") setError("");
            }}
            value={formData.constatPanne || ""}
            placeholder="Décrivez le constat ici..."
          ></textarea>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-between mt-8">
          <button
            className=" bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            onClick={handlePrevious}
          >
            Précédent
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            onClick={handleNext}
          >
            Revue Finale
          </button>
        </div>
      </div>
    </div>
  );
}
