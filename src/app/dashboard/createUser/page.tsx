"use client"
import { useState } from "react"
import Header from "../../header"
import { Utilisateur } from "@/app/interfaces";
import { ajouterUtilisateur } from "@/app/prisma";
export default function Compte(){
    const[Popup,SetPopup] = useState(false);
    const[Role,SetRole] = useState("Direction generale");
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [structure, setStructure] = useState("");
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        SetRole(event.target.value);
      }
    const handleUser = async (e: React.FormEvent) => {
        e.preventDefault();
    }
    

    const privilege = [
      { id: "admin", label: "Admin" },
      { id: "vehicule", label: "Ajouter/modifier/supprimer un véhicule" },
      { id: "AffVehicule", label: "Affectation des véhicules" },
      { id: "kmh", label: "Ajouter/modifier le kilométrage/heure de fonctionnement d'un véhicule" },
      { id: "user", label: "Ajouter/modifier/supprimer un utilisateur" },
      { id: "DI", label: "Ajouter/modifier/supprimer la demande d'intervention" },
      { id: "RI", label: "Ajouter/modifier/supprimer le rapport d'intervention" },
      { id: "SIH", label: "Ajouter/modifier/supprimer la situation d'immobilisation hebdomadaire" },
    ];
    const openPopup = () => {
      setNom("");
      setPrenom("");
      setEmail("");
      setTel("");
      setUsername("");
      setPassword("");
      setStructure("");
      setCheckedItems([]);
      SetPopup(true);
    
  }
   
    const handleItems = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { id, checked } = event.target;
  
      if (id === "admin") {
        
        setCheckedItems(checked ? privilege.map((opt) => opt.id) : []);
      } else {
        // Update the list for individual checkboxes
        setCheckedItems((prev) =>
          checked ? [...prev, id] : prev.filter((item) => item !== id)
       
        );
       
        
      }
      const privilegelist = checkedItems.join("/")
      console.log(privilegelist);
      
    };
    return(
        <div className="bg-[#dcdfe8] ">
           <Header/>
         <div className="flex flex-1 pt-[12vh] h-lvh ">
           
           <main className="  w-full h-full flex-1  ">
           <div className="flex  justify-end">
           <button onClick = {() => SetPopup(true)} className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-gray-900 hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">ajouter</button>
            </div>
           {
            Popup &&
           <div className=" fixed top-0 left-0 w-full h-full border-4 border-black flex items-center justify-center bg-black/50 z-50">
             <form className="border-4 border-black relative bg-[#a8a8a8]"
              onSubmit={handleUser}>
                <button 
                onClick={(e) => { e.preventDefault(); SetPopup(false); }}  className="text-black" aria-label="Close popup">  X
                </button>

              <div>

                <label htmlFor="nom">Nom:</label>
                <input 
                id="nom"
                name="nom"
                type="text"
                placeholder="Nom"
                onChange={(e) => setNom(e.target.value)}
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />

             

                <label htmlFor="prenom">Prenom:</label>
                <input 
                id="prenom"
                name="prenom"
                type="text"
                placeholder="Prenom"
                onChange={(e) => setPrenom(e.target.value)}
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
             
              </div>

              <div>
                <label htmlFor="email">Email:</label>
                <input 
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />

              

                <label htmlFor="Tel">Numero Tel:</label>
                <input 
                id="tel"
                name="tel"
                type="tel"
                placeholder="Numero de telephone"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>
              </div>
              <div>
                <label htmlFor="username">Utilisateur:</label>
                <input 
                id="username"
                name="username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom utilisateur"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>
                      
                <label htmlFor="password">Mot de passe:</label>
                <input 
                id="password"
                name="password"
                type="password"
                placeholder="Mot de passe"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>
              </div>
              <div>
              <select id="role"
               value={Role}
                onChange={handleChange}
                className="text-black">
        <option className="text-black" value="DG">Direction generale</option>
        <option className="text-black" value="branche">Branche</option>
        <option className="text-black" value="district">District</option>
        <option className="text-black" value="centre">Centre</option>
        <option className="text-black" value="ST">Service transport</option>
        <option className="text-black" value="SM">Service maintenance</option>
      </select>
             
                <label htmlFor="structure">Structure:</label>
                <input 
                id="structure"
                name="structure"
                type="text"
                placeholder="La structure"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
              </div>
              <fieldset className="border border-gray-300 p-4 rounded-md">
      <legend className="text-lg font-semibold">Privilege:</legend>
      {privilege.map((option) => (
        <label key={option.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={option.id}
            name={option.id}
            value={option.id}
            checked={checkedItems.includes(option.id)}
            onChange={handleItems}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
              <button
              type="submit"
              className="w-1/3 ml-[70px] bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                    Confirmer
              </button>
              <button
              onClick = {() => SetPopup(false)} 
              className="w-1/3 ml-[70px] bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">Annuler</button>
             </form>
           </div>
}

           </main>
         </div>
           
        </div>
    )
}