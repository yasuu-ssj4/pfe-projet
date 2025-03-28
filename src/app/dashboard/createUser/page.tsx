"use client"
import { useState } from "react"
import Header from "../../header"

export default function Compte(){
    const[Popup,SetPopup] = useState(false);
    const[Role,SetRole] = useState("Direction generale");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        SetRole(event.target.value);
      }
    const handleUser = async (e: React.FormEvent) => {
        e.preventDefault();
    }
    return(
        <div className="flex flex-col min-h-screen bg-[#dcdfe8] ">
           <Header/>
         <div className="flex flex-1 pt-[12vh] h-lvh ">
           
           <main className=" flex-1  ">
           <div className="flex justify-end">
           <button onClick = {() => SetPopup(true)} className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-body-color hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">ajouter</button>
            </div>
           {
            Popup &&
           <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
            <button onClick = {() => SetPopup(false)} className="text-black">X</button>
             <form onSubmit={handleUser}>
              <div>
                <label htmlFor="nom">Nom:</label>
                <input 
                id="nom"
                name="nom"
                type="text"
                placeholder="Nom"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
              </div>
              <div>
                <label htmlFor="prenom">Prenom:</label>
                <input 
                id="prenom"
                name="prenom"
                type="text"
                placeholder="Prenom"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input 
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
              </div>
              <div>
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
                placeholder="Nom utilisateur"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>
              </div>
              <div>
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
              </div>
              <div>
                <label htmlFor="structure">Structure:</label>
                <input 
                id="structure"
                name="structure"
                type="text"
                placeholder="La structure"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
              </div>
              <button
              type="submit"
              className="w-1/2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                    Confirmer
              </button>
              <button
              onClick = {() => SetPopup(false)} 
              className="w-1/2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">Annuler</button>
             </form>
           </div>
}

           </main>
         </div>
           
        </div>
    )
}