"use client";
import { useEffect, useState, useRef } from "react";
import { VehicleForm } from "./formVehicules";
import { Structure } from "@/app/interfaces";

type StepOneProps = {
    FormValue: VehicleForm;// replace with the correct interface for your form
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    SetPopup: React.Dispatch<React.SetStateAction<boolean>>;
  };
const StepOne: React.FC<StepOneProps> = ({ FormValue, handleChange, SetStep, SetPopup }) => {
    const[genre,setGenre] = useState<any[]>([]);
    const[marque,setMarque] = useState<any[]>([]);
    const[type,setType] = useState<any[]>([]);
    const[dataCentre, setDataCentre] = useState<any[]>([]);
    const [showOptions, setShowOptions] = useState(false);
    const [filteredCentre, setFilteredCentre] = useState<any[]>([]);
    const[selected,setSelected] =  useState<Structure | null>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    useEffect(() => {
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

      
    useEffect(() => {
        const fetchGenres = async () => {
          const response = await fetch("/api/vehicule/genre", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          const data = await response.json();
          
          
          setGenre(data);
        };
        fetchGenres();
      }, []);

      //fonction pour recevoir les marques
      useEffect(() => {
        const fetchMarques = async() => {
            const response = await fetch('/api/vehicule/marque', {
                method: "GET",
                headers: {
                    "Content-type" : "application/json",
                },
            });
            const data = await response.json();
            
            
            setMarque(data);
        };
       fetchMarques();
      }, []);
    

      //fonction pour recevoir les types d'apres la marque choisi
      useEffect(() => {
        const fetchTypes = async() => {
        if(!FormValue.code_marque) return;
        try{
            const response = await fetch("/api/vehicule/type", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: "get", id_marque: FormValue.code_marque   }),
              });
              if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur API:", errorText);
                return;
              }
        
              const data = await response.json();
             
              setType(data);
        }catch (error) {
            console.error("Erreur dans fetchTypes ⚠️:", error);
          };
        };
        fetchTypes();
      }, [FormValue.code_marque]);
      //console.log(type);

      //pour recevoir les centres
      useEffect(() => {
        const fetchCentres = async() => {
            const response = await fetch('/api/structure/verifierStructures', {
                method: 'POST',
                headers: {
                  'Content-type' : 'application/json',
                },
                body: JSON.stringify({type: 'Centre' }),
              });
              const data = await response.json();
              setDataCentre(data);
        };
        fetchCentres();
      },[]);

            //pour la rechercher des centres d'apres leur designation
              useEffect(() => {
                const filtered = dataCentre.filter((item) =>
                item.designation.toLowerCase().includes(FormValue.code_structure.toLowerCase())
              );
              setFilteredCentre(filtered);
              },[FormValue.code_structure, dataCentre]);
              const handleSelect = (option: Structure) => {
                setSelected(option);
                FormValue.code_structure = option.code_structure;
                setShowOptions(false);
              };;
              const selectedGenre = FormValue.code_genre;
              const selectedMarque = FormValue.code_marque;
              const selectedType = FormValue.code_type;
            const selectedCentre =  FormValue.code_structure;
            const steponeinfos = {
                code_genre: selectedGenre ,
                code_marque: selectedMarque,
                code_type: selectedType,
                code_structure: selectedCentre,
            };
            

             
    return(
        
            <div className="bg-[#f2f2f2] p-6  rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Ajouter un vehicule</h2>
         <div className="grid">
            <div>
               <label htmlFor="code_genre">Genre</label>
               <select
               id="code_genre"
               name="code_genre"
               onChange={handleChange}
               value={FormValue.code_genre}>
                {genre.map((option) => (
                    <option key={option.code_genre}
                    value={option.code_genre}>
                        {option.designation}
                    </option>
                ))}
               </select>
            </div>
            <div>
               <label htmlFor="code_marque">Marque</label>
               <select
               id="code_marque"
               name="code_marque"
               onChange={handleChange}
               value={FormValue.code_marque}>
                  {marque.map((option) => (
                    <option key={option.id_marque} value={option.id_marque}>
                        {option.designation}
                    </option>
                  ))}
               </select>
            </div>
            <div>
               <label htmlFor="code_type">Type</label>
               <select
               id="code_type"
               name="code_type"
               onChange={handleChange}
               value={FormValue.code_type}>
                  {type.map((option) => (
                    <option key={option.id_type} value={option.id_type}>
                        {option.designation}
                    </option>
                  ))}
               </select>
            </div>
            <div>
                   <label htmlFor="code_structure">La structure</label>
                  <div ref={boxRef}>
                  <input
                  type="text"
                  id="code_structure"
                  name="code_structure"
                  placeholder="rechercher par la designation de la structure"
                  onFocus={() => setShowOptions(true)}
                  onChange={handleChange}
                  value={FormValue.code_structure}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                />
                {showOptions && filteredCentre.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-40 overflow-y-auto">
          {filteredCentre.map((option) => ( 
            <li
              key={option.code_structure}
              value={option.code_structure}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {option.designation}-{option.code_structure}
            </li>
          ))}
        </ul>
      )}
      </div>
                  </div>
         </div>
         <div className="flex justify-end mt-10 space-x-4">
                <button
                type="button"
              onClick = {() => SetPopup(false)} 
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">Annuler</button>
              <button
               onClick={() => SetStep(2)} 
               className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
              >Suivant</button>
              </div>
      </div>
    );
}
export default StepOne;