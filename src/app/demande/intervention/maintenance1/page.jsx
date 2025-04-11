 // app/(intervention)/maintenance1/page.jsx
 "use client";
 
 import React, { useState } from "react";
 import { useRouter } from "next/navigation";
 import { useFormData } from "../../components/FormContext";
 import RadioGroup from "../../components/RadioGroup"; 
 const stepss = ["Étape 1", "Étape 2", "Étape 3", "Étape 4"]
 
 
 
 export default function Maintenance1() {
   const router = useRouter();
   const { updateField, formData } = useFormData();
    const [stepp] = useState(0);  
   const [error, setError] = useState(false);
 
   const {
     priorite = "",
     permisTravail = false,  
     routRef = "",
     danRef = "",
   } = formData;
 
   const handlePermisChange = (value) => {
     const isOui = value === "oui";
     updateField("permisTravail", isOui);
     if (!isOui) {
       updateField("routRef", "");
       updateField("danRef", "");
     }
   };
 
   const handleTravailTypeChange = (type, refValue = "") => {
     
     if (type === "routin") {
       updateField("routRef", refValue);
       
     } else if (type === "danger") {
       updateField("danRef", refValue);
        
     }
   };
 
   const handleRadioTravailClick = (type) => {
    
     if (type === "routin") {
       updateField("danRef", "");  
 
     } else if (type === "danger") {
       updateField("routRef", "");  
     }
   
   };
 
   const handleNext = () => {
     const isPrioValid = priorite !== "";
     const isPermisValid = typeof permisTravail === "boolean";
     
     const isRefValid =
       !permisTravail ||
       (permisTravail && (routRef.trim() !== "" || danRef.trim() !== ""));
 
     const isValid = isPrioValid && isPermisValid && isRefValid;
 
     if (isValid) {
       setError(false);
       router.push("/maintenance2");  
     } else {
       setError(true);
     }
   };
 
   const prioriteOptions = [
     { value: "1", label: "(1)" },
     { value: "2", label: "(2)" },
     { value: "3", label: "(3)" },
   ];
 
   return (
     <div className="p-6 flex flex-col gap-6 text-gray-800">
       <div className=" bg-white p-6 rounded-2xl shadow-md ">
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
         <div className="space-y-6">
           {" "}
           {/* Espacement sections */}
           {/* Niveaux de priorisation */}
           <h4 className="text-amber-600 mb-2 text-md font-medium">Niveaux de priorisation:</h4>
           <RadioGroup
             name= "priorite"
              
             options={prioriteOptions}
             formData={formData}
             updateField={updateField}
           />
           {/* Permis de travail */}
           <div className="necessitent">

             <h4 className="text-md font-medium  text-amber-600 mb-2">
               Nécessitent-ils un permis de travail ? :
             </h4>
             <div className="flex gap-4">
               <div>
                 <input
                   type="radio"
                   name="permisRadio"
                   id="permis-oui"
                   checked={permisTravail === true}
                   onChange={() => handlePermisChange("oui")}
                   className="mr-1 form-radio"
                 />
                 <label htmlFor="permis-oui" className="text-sm">
                   Oui
                 </label>
               </div>
               <div>
                 <input
                   type="radio"
                   name="permisRadio"
                   id="permis-non"
                   checked={permisTravail === false}
                   onChange={() => handlePermisChange("non")}
                   className="mr-1 form-radio"
                 />
                 <label htmlFor="permis-non" className="text-sm">
                   Non
                 </label>
               </div>
             </div>
 
             {/* Afficher si permisTravail est true */}
             {permisTravail === true && (
               <div className="mt-4 pl-4 border-l-2 border-yellow-400">
                 {" "}
                 {/* Indentation visuelle */}
                 <h5 className="text-md font-medium  text-amber-600 mb-2">
                   Si oui, type de permis :
                 </h5>
                 {/* Routinier */}
                 <div className="ROUTIN mb-3 flex flex-wrap items-center gap-2">
                   {" "}
                   {/* Flex wrap pour responsive */}
                   <input
                     type="radio"
                     name="travailTypeRadio"
                     id="routin"
                     checked={routRef.trim() !== ""}
                     onChange={() => handleRadioTravailClick("routin")}
                     className="mr-1 form-radio"
                   />
                   <label htmlFor="routin" className="text-sm flex-shrink-0">
                     Routinier - PT Réf :
                   </label>
                   <input
                     type="text"
                     id="routinRefInput"
                     placeholder="Référence..."
                     value={routRef}
                     onChange={(e) =>
                       handleTravailTypeChange("routin", e.target.value)
                     }
                     className="input   min-w-[150px]  border border-gray-300 rounded-md px-3 py-1 text-sm flex-1"
                     disabled={danRef.trim() !== ""}
                   />{" "}
                   {/* min-width */}
                 </div>
                 {/* Dangereux */}
                 <div className="DANGER mb-3 flex flex-wrap items-center gap-2">
                   <input
                     type="radio"
                     name="travailTypeRadio"
                     id="danger"
                     checked={danRef.trim() !== ""}
                     onChange={() => handleRadioTravailClick("danger")}
                     className="mr-1 form-radio"
                   />
                   <label htmlFor="danger" className="text-sm flex-shrink-0">
                     Dangereux - PT Réf :
                   </label>
                   <input
                     type="text"
                     id="dangerRefInput"
                     placeholder="Référence..."
                     value={danRef}
                     onChange={(e) =>
                       handleTravailTypeChange("danger", e.target.value)
                     }
                     className="input flex-1 min-w-[150px]  border border-gray-300 rounded-md px-3 py-1 text-sm "
                     disabled={routRef.trim() !== ""}
                   />
                 </div>
               </div>
             )}
           </div>
           {error && (
             <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 border border-red-200 rounded">
               Merci de remplir tous les champs obligatoires correctement
               
             </div>
           )}
         </div>
         <div className="flex justify-end mt-8">
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