"use client";

import { useState, useEffect } from "react";
import { RapportIntervention } from "@/app/interfaces";
import { rapport_intervention } from "@prisma/client";
import { Form } from "formik";

export default function FormRapport(){
  type infos= {
    structure_maintenance : string ,
    date_heure_panne: Date ,
    district_id: string ,
    centre_id: string ,
};
  const[Popup,SetPopup] = useState(false);
  const[disabled,setDisabled] = useState(false);
  const[Data,setData] = useState<infos>({
    structure_maintenance:'',
    date_heure_panne: new Date(),
    district_id: '',
    centre_id: '',
  });
const[FormValue,SetFormValue] = useState<RapportIntervention>({
    id_demande_intervention: "2",
    id_rapport_intervention: "",
    structure_maintenance_charge:"",
    date_application: new Date(),
    date_debut_travaux: "",
    date_fin_travaux: "",
    date_panne: new Date(),
    date_prise_charge: "",
    duree_travaux: "",
    numero_OR: "",
    district: "",
    centre: "",
    description_essais: "",
    essais: "oui",
    reservation: "" ,
    cout_total_traveaux_interne: 0,
    cout_total_traveaux_externe: 0,
    reference_documentée: "",
    date_fin_permis: "",
    nom_utilisateur: "",
    date_utilisateur: new Date(),
    nom_prenom_demandeur: "",
    date_demandeur: "",
    nom_prenom_responsable: "",
    date_responsable: "",
});

const OpenPopup = (e: React.MouseEvent<HTMLButtonElement>) => {
    SetFormValue({
    id_demande_intervention: "2",
    id_rapport_intervention: "",
    structure_maintenance_charge:"",
    date_application: new Date(),
    date_debut_travaux: "",
    date_fin_travaux: "",
    date_panne: "",
    date_prise_charge: "",
    duree_travaux: "",
    numero_OR: "",
    district: "",
    centre: "",
    description_essais: "",
    essais: "oui",
    reservation: "" ,
    cout_total_traveaux_interne: 0,
    cout_total_traveaux_externe: 0,
    reference_documentée: "",
    date_fin_permis: "",
    nom_utilisateur: "",
    date_utilisateur: new Date(),
    nom_prenom_demandeur: "",
    date_demandeur: "",
    nom_prenom_responsable: "",
    date_responsable: "",
    });
    SetPopup(true);
};
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    SetFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(FormValue.date_panne);
    if (FormValue.essais === "oui") FormValue.reservation = "";
    console.log(FormValue); 
    //SetPopup(false); 
    try{
      const response = await fetch("/api/rapport/ajouterRapport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rapportInfos),
      });
      const data =  response.json();
      console.log(data);
    }catch (error) {
      console.error("Error in FormRapport:", error);
    }
  
 };
 function formatHeureToInputValue(date: Date | string | null) {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return parsedDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
 function formatDateToInputValue(date?: Date | string | null) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  //pour calculer la duree des travaux et l afficher en heure minute
  useEffect(() => {
    if (FormValue.date_debut_travaux && FormValue.date_fin_travaux) {
      const start = new Date(FormValue.date_debut_travaux);
      const end = new Date(FormValue.date_fin_travaux);
  
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
  
        if (diffMs >= 0) {
          const totalMinutes = Math.floor(diffMs / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
  
          const formatted = `${hours}h ${minutes}min`;
  
          SetFormValue((prev) => ({
            ...prev,
            duree_travaux: formatted,
          }));
        }
      }
    }
  }, [FormValue.date_debut_travaux, FormValue.date_fin_travaux]);
  useEffect(() => {
    if (FormValue.essais === "oui") {
      SetFormValue((prev) => ({
        ...prev,
        reservation: "",
      }));
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [FormValue.essais]);
  useEffect(() =>{
      const fetchData = async() => {
        const response = await fetch("/api/rapport/getDemandeInfos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({id_demande_intervention : FormValue.id_demande_intervention = "2"  }),
        });
      
        const data = await response.json();
        setData(data);
      }; fetchData();
  },[]);
  const rapportInfos : RapportIntervention = {
    id_demande_intervention : FormValue.id_demande_intervention ,
    id_rapport_intervention : FormValue.id_rapport_intervention,
    structure_maintenance_charge : Data.structure_maintenance ,
    date_application : FormValue.date_application , 
    date_debut_travaux : FormValue.date_debut_travaux ,
    date_fin_travaux : FormValue.date_fin_travaux ,
    date_panne : new Date(Data.date_heure_panne),
    date_prise_charge : FormValue.date_prise_charge ,
    duree_travaux: FormValue.duree_travaux,
    district : Data.district_id ,
    centre : Data.centre_id , 
    numero_OR : FormValue.numero_OR,
    description_essais : FormValue.description_essais , 
    essais : FormValue.essais , 
    reservation : FormValue.reservation , 
    cout_total_traveaux_externe : FormValue.cout_total_traveaux_externe ,
    cout_total_traveaux_interne : FormValue.cout_total_traveaux_interne ,
    reference_documentée : FormValue.reference_documentée , 
    date_fin_permis : FormValue.date_fin_permis ,
    nom_utilisateur : FormValue.nom_utilisateur ,
    date_utilisateur : FormValue.date_utilisateur ,
    nom_prenom_demandeur : FormValue.nom_prenom_demandeur ,
    date_demandeur : FormValue.date_demandeur ,
    nom_prenom_responsable : FormValue.nom_prenom_responsable ,
    date_responsable : FormValue.date_responsable ,
  };
  console.log(Data);
  console.log(typeof(Data.date_heure_panne));
  console.log(typeof(FormValue.date_application));
  
  console.log(rapportInfos);
 
  
  return(
    <div>
        <button onClick = {OpenPopup} className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-gray-900 hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">ajouter rapport</button>
        {Popup && (
            <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50  ">
    <form 
    onSubmit={handleSubmit}
    className='bg-[#f6f6f6] w-full max-w-4xl max-h-[90vh] overflow-y-auto '>
        <div className='   '>
            <table className=' flex justify-center '>
                <thead>
                    <tr className='border-2 border-black   '>
                        <th className='border-2 border-black    '>
                        <img src="/logo-naftal.png" alt="NAFTAL Logo" className='w-full h-full object-cover'  />
                             </th>
                        <th className='border-2 border-black text-black text-2xl'>
                            <h2>RAPPORT  D'INTERVENTION </h2>
                        </th>
                         <th className='border-2  border-black   '>
                        <h4 className='border-b-2 border-black w-full text-center '>ER.NAF.MNT.20.V1</h4>
            
                        <label htmlFor="date_application"
                         className='text-black'>
                            Date application :
                            </label>
                        <br />
                        <p className="text-black">{FormValue.date_application.toLocaleDateString('fr-FR')}</p> 
                     </th>
                      
                    </tr> 
                </thead>
            </table>
         </div>
        <table className=' border border-black   '>
            <thead>
                <tr className='border-2 border-black   '>
                <th className='border-2 border-black  '>
                    <label htmlFor="id_rapport_intervention" className='mt-[2px]'>N° :</label>
                    <input 
                    id='id_rapport_intervention'
                    name="id_rapport_intervention"
                    onChange={handleChange}
                    value={FormValue.id_rapport_intervention}
                    className='px-4'
                    placeholder='...................................................' />        
                    <h4>Structure Maintenance en charge des travaux :</h4>
                    <span>{FormValue.structure_maintenance_charge = Data.structure_maintenance }</span>
                </th>
                <th className='border-2 border-black     '>
                    <h4>DI N°:</h4>
                    <p>{FormValue.id_demande_intervention}</p>
                </th>
              <th className='border-2 border-black     '>
                <h4>Appartenance du Bien</h4>
              </th>
              </tr>
            </thead>
            <tbody>
            <tr className='border-2 border-black   '>
                <td className='border-2 border-black     '>
                <h4>Date et heure début des travaux :</h4>
                <label htmlFor="date_debut_travaux">Le </label>
                <input
                type="datetime-local"
                id="date_debut_travaux"
                name="date_debut_travaux"
                onChange={handleChange}
                value={FormValue.date_debut_travaux}/>
                     <br />
                    {/*<span className='text-red-500 text-sm'>{erreurdates ? "la date de debut   doit etre sup a la date de la prise en charge" : ""}</span> */}   
                </td>
                <td className='border-2 border-black  '>
                    <h4>Date et Heure de la panne ou de l'avarie :</h4>
                    <h4>Le </h4>
                    <span>{formatDateToInputValue(Data.date_heure_panne)}</span>  
                  <h4> à </h4>
                  <span>{formatHeureToInputValue(Data.date_heure_panne)}</span>  
                </td>
                <td className='border-2 border-black  '>
                    <h4>District / Autre: </h4>
                    <span>{FormValue.district = Data.district_id}</span>
                </td>  
             </tr>
            <tr className='border-2 border-black'>
               <td className='border-2 border-black'>
                <h4>Date et heure fin des travaux :</h4>
                <label htmlFor="date_fin_travaux">Le </label>
                    <input 
                    type="datetime-local" 
                    id='date_fin_travaux' 
                    name='date_fin_travaux'
                    onChange={handleChange}
                    value={FormValue.date_fin_travaux}
                    />
                     <br />
                    {/*<span className='text-red-500 text-sm py-[3px]'>{erreurdate ? " la date de fin doit etre supérieure a la date de debut " :" "}</span>*/}
                </td>
                <td className='border-2 border-black  '>
                <label htmlFor="numero_OR">OR N° : </label>
                <input 
                id='numero_OR'
                name='numero_OR'
                onChange={handleChange}
                value={FormValue.numero_OR}
                className='px-2'
                placeholder ='........................................................................' 
                />
                </td>
                <td rowSpan={2}className='border-2 border-black '>
                <h4>Centre / Autre: </h4>
                <span>{FormValue.centre = Data.centre_id}</span>
                     </td>
            </tr>
            <tr className='border-2 border-black  '>
                <td className='border-2 border-black  '>
                    <label htmlFor="duree_travaux">Durée des travaux :</label>
                    <p className='text-black'>{FormValue.duree_travaux}</p>
                </td>
                <td className='border-2 border-black   '>
                <h4>Date et heure de prise  en charge des travaux :</h4>
                <label htmlFor="date_prise_charge">Le </label>
                    <input 
                    type="datetime-local" 
                    id='date_prise_charge'
                    name="date_prise_charge" 
                    onChange={handleChange}
                    value={FormValue.date_prise_charge}
                    />
                    <br />
                  <span></span>
                </td>
            </tr>
            </tbody>
        </table>
        <h4 className=' border-2 border-black    text-center'>Essais et Tests de fonctionnement</h4>
       <table className=' border border-black  '>
        <tbody>
            <tr className='border-2 border-black  '>
                <td className='border-2 border-black '>
                    <label htmlFor="description_essais">Nature des Essais et/ou tests de fonctionnement realisées (Description sommaire) : </label>
                    <br />
                    <input
                    id="description_essais"
                    name='description_essais'
                    onChange={handleChange}
                    value={FormValue.description_essais}
                    className="input  w-full 5 border border-gray-400    rounded-md  text-sm flex-1" 
                    placeholder="Saisir la nature des essais ou/et tests de fonctionnement realisées..."/>
                    </td>
           <td className='border-2 border-black   '>
            <div className=''> 
            <h4>Essais et/ou tests concluant ? :</h4>
            <div className="flex gap-4 px-30 py-4.5  ">
               <div>
                 <input
                   type="radio"
                   name="essais"
                   id="permis-oui"
                   className="mr-1 form-radio"
                   onChange={handleChange}
                   value={"oui"}
                   checked={FormValue.essais === "oui"}
                 />
                 <label htmlFor="permis-oui" className="text-sm">
                   Oui
                 </label>
               </div>
               <div>
                 <input
                   type="radio"
                   name="essais"
                   id="permis-non"
                   onChange={handleChange}
                   value={"non"}
                   checked={FormValue.essais === "non"}
                   className=" form-radio"
                 />
                 <label htmlFor="permis-non" className="text-sm">
                   Non
                 </label>
               </div>             
             </div>
             </div>
               <div className="  ">
                 <label 
                 htmlFor="reservation"
                 className="text-md font-medium ">
                   Si non , Réserves :
                 </label>
                 <input
                 id="reservation"
                 placeholder="..........................................................."
                 name='reservation'
                 onChange={handleChange}
                 disabled={disabled}
                 value={FormValue.reservation ?? ""}
                 className="input    border border-gray-400 rounded-md   text-sm flex-1" />
               </div>
           </td>
            </tr>
            <tr className='border-2 border-black  ' >
         <td className='border-2 border-black '>
            <label htmlFor="reference_documentée">La Référence (s) documentée (s) : </label>
            <input  
            id="reference_documentée"
            name="reference_documentée"
            onChange={handleChange}
            value={FormValue.reference_documentée}
            placeholder='.............................................................' 
            />
         </td>
         <td className='border-2 border-black '>
         <label htmlFor="date_fin_permis">Date fin permis de travail  : </label>
            <input 
            type="date" 
            id="date_fin_permis"
            name="date_fin_permis"
            onChange={handleChange}
            value={FormValue.date_fin_permis}
            placeholder='.............................................................' 
            /> 
         </td>
            </tr>
        </tbody>
       </table>
       <table className=' border border-black   '>
        <thead className=''   >
        <tr className='border-2 border-black   '>
            <th className='border-2 border-black    '>
            <h4>Etabli par :</h4>     
            </th>
            <th className='border-2 border-black   '>
            <h4>Vérifé par :</h4>   
            </th>
            <th className='border-2 border-black     '>
            <h4>Validé par :</h4> 
            </th>
        </tr>
        </thead>
        <tbody>
            <tr className='border-2 border-black  '>
            <td className='border-2 border-black  '>
            <h4>intervenant :</h4> 
                    <div className="flex">
                         <label htmlFor="nom_utilisateur">Nom et Prénom :</label>
                <input 
                type="text" 
                id='nom_utilisateur' 
                name="nom_utilisateur"
                onChange={handleChange}
                value={FormValue.nom_utilisateur}
                className=' w-1/2 text-black'/>
                     </div>
                     <div className="flex">
                         <h4 className="text-black"> Date :</h4> 
                <p className="text-black justify-start">{FormValue.date_utilisateur.toLocaleDateString('fr-FR')}</p>
                </div>
                    
                    <h4>Visa :</h4>

            </td>
             <td className='border-2 border-black  px-3 py-5'>
             <h4>Responsable Maintenance :</h4> 
                    <br />
            <label htmlFor="nom_prenom_responsable"> Nom et Prénom  :</label>
                <input 
                type="text" 
                id='nom_prenom_responsable' 
                name="nom_prenom_responsable"
                onChange={handleChange}
                value={FormValue.nom_prenom_responsable}      
                className='text-black'/> 
            <label htmlFor="date_responsable"> Date :</label>
                <input 
                type="date" 
                id='date_responsable' 
                name="date_responsable"
                onChange={handleChange}
                value={FormValue.date_responsable}      
                className=' '/> 
                    
                    <h4 className="text-black">Visa :</h4>

             </td>
            <td className='border-2 border-black  px-3 py-5'> 
            <h4>demandeur  :</h4> 
                         <label htmlFor="nom_prenom_demandeur"> Nom et Prénom  :</label>
                <input 
                type="text" 
                id='nom_prenom_demandeur' 
                name="nom_prenom_demandeur"
                onChange={handleChange}
                value={FormValue.nom_prenom_demandeur}/> 
                <label htmlFor="date_demandeur"> Date :</label>
                    <input 
                    type="date" 
                    id='date_demandeur'
                    name='date_demandeur'
                    onChange={handleChange}
                    value={FormValue.date_demandeur}  
                    /> 
                <br />
                    
                    <h4>Visa :</h4>

            </td>
           </tr>
        </tbody>
       </table>
       <div className="flex justify-evenly mt-10 space-x-4">
            <button
           type="button"
           onClick={() => SetPopup(false)}
           className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">
            Annuler
           </button>
           <button
           type="submit"
           className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300">
                  Confirmer
           </button>
           </div>
    </form>
        </div>)}
    </div>
)
};
