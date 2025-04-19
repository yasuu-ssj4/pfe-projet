"use client";
import { useState } from "react";
import StepOne from "./stepOne";
import StepTwo from "./stepTwo";
import StepThree from "./stepThree";
import StepFour from "./stepFour";
//NE MODIFIE PAS CETTE INTERFACE ELLE EST IMPORTANTE POUR QUE LE FORM S ENVOIE DANS LE BON TYPE
export interface VehicleForm {
    code_vehicule: string;
    code_genre: string;
    code_marque: number;
    code_type: number;
    unite_predication: string;
    kilo_parcouru_heure_fonctionnement: number | string;
    code_status: string;
    code_structure: string;
    n_immatriculation: string;
    n_serie: string;
    date_acquisition: string ;
    prix_acquisition: number | null ;
    n_inventaire: string;
    date_debut_assurance: string | null;
    date_fin_assurance: string | null;
    date_debut_controle_technique: string | null;
    date_fin_controle_technique: string | null;
    date_debut_atmd: string | null;
    date_fin_atmd: string | null;
    date_debut_permis_circuler: string | null;
    date_fin_permis_circuler: string | null;
    date_debut_certificat: string | null;
    date_fin_certificat: string | null;
  };

export default function FormVehicule(){
    
    const[Popup,SetPopup] = useState(false);
    const[Step,SetStep] = useState(1);
    const[FormValue,SetFormValue] = useState<VehicleForm>({
        code_vehicule:"",
        code_genre:"",
        code_marque:1,
        code_type:1,
        unite_predication:"",
        kilo_parcouru_heure_fonctionnement: 0,
        code_status: "",
        code_structure:"",
        n_immatriculation:"",
        n_serie:"",
        date_acquisition: "",
        prix_acquisition: null ,
        n_inventaire:"",
        date_debut_assurance: "",
        date_fin_assurance: "",
        date_debut_controle_technique: "",
        date_fin_controle_technique: "",
        date_debut_atmd: "",
        date_fin_atmd: "",
        date_debut_permis_circuler: "",
        date_fin_permis_circuler: "",
        date_debut_certificat: "",
        date_fin_certificat: "",
     });
     //fonction pour rendre les dates en dd/mm/yyyy
     function formatDateDDMMYYYY(date: Date): string {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    //fonction pour rendre les dates de type string a Date
    function cleanAndConvert<T extends Record<string, any>>(
      data: T,
      dateKeys: (keyof T)[],
      formatDates = false
    ): { [K in keyof T]: T[K] | null | Date | string } {
      const cleaned = {} as { [K in keyof T]: T[K] | null | Date | string };
    
      for (const key in data) {
        const value = data[key];
    
        if (value === "") {
          cleaned[key] = null;
          continue;
        }
    
        if (dateKeys.includes(key)) {
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            cleaned[key] = formatDates
              ? formatDateDDMMYYYY(dateObj)
              : dateObj;
            continue;
          }
        }
    
        cleaned[key] = value;
      }
    
      return cleaned;
    }
     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        SetFormValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
      const OpenPopup = (e: React.MouseEvent<HTMLButtonElement>) => {
            SetFormValue({
               code_vehicule:"",
               code_genre:"A",
               code_marque:1,
               code_type:1,
               unite_predication:"Kilometrage",
               kilo_parcouru_heure_fonctionnement: 0,
               code_status: "OPR",
               code_structure:"",
               n_immatriculation:"",
               n_serie:"",
               date_acquisition: "",
               prix_acquisition: null,
               n_inventaire:"",
               date_debut_assurance: "",
               date_fin_assurance: "",
               date_debut_controle_technique: "",
               date_fin_controle_technique: "",
               date_debut_atmd: "",
               date_fin_atmd: "",
               date_debut_permis_circuler: "",
               date_fin_permis_circuler: "",
               date_debut_certificat: "",
               date_fin_certificat: "",
            });
            SetPopup(true);
            SetStep(1);
      };
      //fonction pour rendre tout ces dates de type Date (false:yyyy/mm/dd true:dd/mm/yyyy) a laisse false pour que les dates soit de type Date
      const cleanedForm = cleanAndConvert(FormValue, [
        "date_debut_assurance",
        "date_fin_assurance",
        "date_debut_permis_circuler",
        "date_fin_permis_circuler",
        "date_debut_controle_technique",
        "date_fin_controle_technique",
        "date_debut_atmd",
        "date_fin_atmd",
        "date_debut_certificat",
        "date_fin_certificat",
        "date_acquisition",
      ], false);
      //fonction pour le submit
      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(cleanedForm); // c est elle la form a envoyer utilise cleanedForm.(les attributs)
        SetPopup(false); //pour fermer le popup
     };
    return(
        <div>
            <button 
            onClick={OpenPopup}
            className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-gray-900 hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">
        Ajouter Vehicule
    </button>
    {Popup &&
        <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
        <form
        className="border-4 border-black w-1/2 relative bg-[#f6f6f6]"
        onSubmit={handleSubmit}>
        {Step === 1 && <StepOne FormValue={FormValue} handleChange={handleChange} SetStep={SetStep} SetPopup={SetPopup} />}
        {Step === 2 && <StepTwo FormValue={FormValue} handleChange={handleChange} SetStep={SetStep} SetFormValue={SetFormValue}/>}
        {Step === 3 && <StepThree FormValue={FormValue} handleChange={handleChange} SetStep={SetStep} SetFormValue={SetFormValue}/>}
        {Step === 4 && <StepFour FormValue={FormValue} SetStep={SetStep} SetFormValue={SetFormValue}/>}
        </form>
        </div>
}
        </div>
    );
}