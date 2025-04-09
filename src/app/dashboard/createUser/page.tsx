"use client"
import React, { useState, useEffect } from "react"
import Header from "../../header"
import { Utilisateur } from "@/app/interfaces";


export default function Compte(){
    const[Popup,SetPopup] = useState(false);
    const[Struct,SetStruct] = useState(false);
    const[Step,SetStep] = useState(1);

    const [formValue, setFormValue] = useState({
      nom: "",
      prenom: "",
      username: "",
      email: "",
      tel: "",
      password: "",
      structure: "",
      authType: "BDD",
      est_admin: false,
      droit_acces:"",
      role: "DG",
    });
    const[Role,SetRole] = useState("Direction generale");
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    const handleForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormValue((prev) => ({
    ...prev,
    [name]: value,
  }));
};
    const handlePopup = (e: React.MouseEvent<HTMLButtonElement>) => {
      setCheckedItems([]);
      setFormValue({
        nom: "",
        prenom: "",
        email: "",
        tel: "",
        username: "",
        password: "",
        structure: "",
        droit_acces:"",
        role: "DG",
        authType: "BDD", 
        est_admin: false,
      });
      SetPopup(true);
      SetStep(1);
    }
    const handleNext = async () => {
      SetStep(2)
      try {
        const res = await fetch("/api/validerUser", {
          method: "POST",
          body: JSON.stringify({
            username: formValue.username,
            code_structure: formValue.structure,
          }),
        });
    
        if (!res.ok) {
          const error = await res.json();
          console.log(error.error);
           SetStep(1)
          return;
        }
    
        console.log("Validation réussie !");
        SetStep(2); 
      } catch (err) {
        console.error(err);
        alert("Erreur inattendue !");
        
      }
    };
    
    const handleBack = () => {
      SetStep(1);
    }

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        SetRole(event.target.value);
      }
      const handleUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      const form = e.target as HTMLFormElement; 
      const selectedPrivileges = checkedItems;
      const privs = selectedPrivileges.join("/");
      console.log(privs);
      formValue.droit_acces = privs;
      console.log(formValue);
      const user: Utilisateur = {
        nom_utilisateur: formValue.nom,
        prenom_utilisateur: formValue.prenom,
        username: formValue.username,
        email: formValue.email,
        numero_telephone: formValue.tel,
        mot_de_passe: formValue.password,
        code_structure: formValue.structure,
        methode_authent: formValue.authType,
        est_admin: formValue.est_admin,
        droit_utilisateur: formValue.droit_acces,
        role: formValue.role,
      };
      try{
      const res2 = await fetch("/api/ajouterUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      if (!res2.ok) {
        const error = await res2.json();
        alert("Erreur lors de l'ajout: " + error.error);
        return;
      }
  
      const data = await res2.json();
      console.log("Utilisateur ajouté avec succès:", data);
      alert("Utilisateur ajouté !");
      SetPopup(false);
  
    } catch (err) {
      console.error(err);
      alert("Erreur inattendue !");
    }
  
      SetPopup(false);
    }
  
  
    const handleStruct = async (e: React.FormEvent) => {
      e.preventDefault();
      
    }

    const privilege = [
      { id: "admin", label: "Admin" },
      { id: "user", label: "Compte Utilisateur" },
      { id: "ajouter_user", label: "Ajouter Un Utilisateur" },
      { id: "modifier_user", label: "Modifier Un Utilisateur" },
      { id: "supprimer_user", label: "Supprimer Un Utilisateur" },

      { id: "struct", label: "Structure"},
      { id: "ajouter_structure", label: "Ajouter Une Structure" },
      { id: "modifier_structure", label: "Modifier Une Structure" },
      { id: "supprimer_structure", label: "Supprimer Une Structure" },

      { id: "vehicule", label: "Véhicule"},
      { id: "ajout_vehicule", label: "Ajouter Un Véhicule" },
      { id: "modifier_vehicule", label: "Modifier Un Véhicule" },
      { id: "supprimer_vehicule", label: "Supprimer Un Véhicule" },
     
       { id: "ajouter_DI", label: "Ajouter la Demande d'intervention"},
       { id: "ajouter_QI", label: "Ajouter la qualification d'intervention "},
       { id: "modifier_QI", label: "Modifier la qualification d'intervention"},
       { id: "modifier_DI", label: "Modifier la Demande d'intervention"},
       { id: "supprimer_DI", label: "Supprimer la Demande d'intervention"},

    ];
  
    const users = [
    ];
        const handleItems = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { id, checked } = event.target;
  
      if (id === "admin") {
        formValue.est_admin = true;
        setCheckedItems(checked ? privilege.map((opt) => opt.id) : []);
      } else {
        setCheckedItems((prev) =>
          checked ? [...prev, id] : prev.filter((item) => item !== id)
        );}};
    return(
        <div className="bg-[#dcdfe8] ">
           <Header/>
         <div className="flex flex-1 pt-[12vh] h-lvh ">
           
           <main className="  w-full h-full flex-1  ">
           <div className="flex  justify-end">
            <button onClick = {() => SetStruct(true)} className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-gray-900 hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">ajouter une structure</button>
           <button onClick = {handlePopup} className="bg-black dark:bg-dark-2 border-dark dark:border-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-gray-900 hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">ajouter un compte</button>
            </div>
           {
            Popup &&
           <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
             <form className=" relative bg-[#021526] rounded-2xl"
              onSubmit={handleUser}>
                {Step ===1 && (
                  
                  <div className="bg-[#f2f2f2] p-6 rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Créer un utilisateur</h2>
                <div className="grid grid-cols-4 gap-6">

              

                <label htmlFor="nom">Nom:</label>
                <input 
                id="nom"
                name="nom"
                value={formValue.nom}
                onChange={handleForm}
                type="text"
                placeholder="Nom"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />

             

                <label htmlFor="prenom">Prenom:</label>
                <input 
                id="prenom"
                name="prenom"
                value={formValue.prenom}
                onChange={handleForm}
                type="text"
                placeholder="Prenom"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />
             
              
                <label htmlFor="email">Email:</label>
                <input 
                id="email"
                name="email"
                value={formValue.email}
                onChange={handleForm}
                type="email"
                placeholder="Email"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />

              

                <label htmlFor="tel">Numero Tel:</label>
                <input 
                id="tel"
                name="tel"
                type="number"
                value={formValue.tel}
                onChange={handleForm}
                placeholder="Numero de telephone"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>
            
            <label htmlFor="password">Mot de passe:</label>
                <input 
                id="password"
                name="password"
                value={formValue.password}
                onChange={handleForm}
                type="password"
                placeholder="Mot de passe"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>

                
                              <div className="flex justify-between items-center">

<span className="text-sm font-medium font-semibold text-black">Type d'authentification:</span>

<div className="flex space-x-4">
  <label htmlFor="bdd" className="flex items-center space-x-2 ">
    <input
      id="bdd"
      type="radio"
      name="authType"
      value={"BDD"}
      checked={formValue.authType === "BDD"}
      onChange={handleForm}
      className="peer hidden"
    />
    <div className="w-[15px] h-[15px] border-2 border-[#222] bg-[#eee] hover:bg-[#ccc] rounded-full peer-checked:bg-blue-600"></div>
    <span className="text-gray-900">BDD</span>
  </label>
  <label 
  htmlFor="ad"
  className="flex items-center space-x-1 ">
    <input
      id="ad"
      type="radio"
      name="authType"
      value={"AD"}
      checked={formValue.authType === "AD"}
      onChange={handleForm}
      className="peer hidden"
    />
    <div className="w-[15px] h-[15px] border-2 border-[#222] bg-[#eee] hover:bg-[#ccc] rounded-full peer-checked:bg-blue-600"></div>
    <span className="text-gray-900 ">AD</span>
  </label>
</div>
</div>
                  <br/>
                  <label htmlFor="username">Utilisateur:</label>
                <input 
                id="username"
                name="username"
                value={formValue.username}
                onChange={handleForm}
                placeholder="Nom utilisateur"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"/>

              <label htmlFor="role">Role</label>
              <select 
                id="role"
                name="role"
                value={formValue.role}
                onChange={handleForm}
                className="text-black">
        <option className="text-black" value="DG">Direction generale</option>
        <option className="text-black" value="branche">Branche</option>
        <option className="text-black" value="district">District</option>
        <option className="text-black" value="centre">Centre</option>
        <option className="text-black" value="ST">Service transport</option>
        <option className="text-black" value="SM">Service maintenance</option>
      </select>
      <br/>
                <label htmlFor="structure">Structure:</label>
                <input 
                id="structure"
                name="structure"
                value={formValue.structure}
                onChange={handleForm}
                type="text"
                placeholder="La structure"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black" />

                </div>
                <div className="flex justify-end mt-10 space-x-4">
                <button
              onClick = {() => SetPopup(false)} 
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">Annuler</button>
              <button onClick={handleNext}
               className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
              >Suivant</button>
              </div>
              
              </div>
                )}

                {Step === 2 && (
                  <div className="bg-[#f2f2f2] p-6 rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
              <fieldset className="border border-gray-300 p-4 rounded-md">
      <legend className="text-lg font-semibold">Privilege:</legend>

      {privilege.map((option) => (
        <label key={option.id} htmlFor={option.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={option.id}
            name="privilege"
            value={option.id}
            checked={checkedItems.includes(option.id)}
            onChange={handleItems}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
    <div className="flex place-content-evenly">
              <button 
              onClick={handleBack}
              className="w-1/3  bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                Retourner
              </button>
              <button
              type="submit"
              className="w-1/3  bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                    Confirmer
              </button>
              </div>
       </div>      
    )}
    </form>
           </div>
}

{
  Struct &&
  <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
             <form className="border-4 border-black w-1/3 relative bg-[#f6f6f6]"
              onSubmit={handleStruct}>
                <button onClick = {() => SetStruct(false)} className="text-black">X</button>
                <div className="grid">
                <label htmlFor="structure">Structure :</label>
                <input 
                id="structure"
                name="structure"
                type="text"
                placeholder="Nom de la structure"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                />
               
                <label htmlFor="code">Code de la structure :</label>
                <input 
                id="code"
                name="code"
                type="text"
                placeholder="Code"
                className=" mt-1 p-2 border-black rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                />
                
                <label htmlFor="structure_parent">La structure parent :</label>
                <input 
                id="structure_parent"
                name="structure_parent"
                type="text"
                placeholder="Nom de la structure parent"
                className=" mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
                />
                <br />
                <div className='relative z-20'>
                      <select id="type_hierarchie"
               value={Role}
                onChange={handleChange}
                className='relative z-20 w-full appearance-none rounded-lg border border-stroke dark:border-dark-3  py-[10px] px-5 text-dark-6 outline-none bg-transparent transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2'>
        <option className="text-black" value="DG">Direction generale</option>
        <option className="text-black" value="branche">Branche</option>
        <option className="text-black" value="district">District</option>
        <option className="text-black" value="centre">Centre</option>
        <option className="text-black" value="ST">Service transport</option>
        <option className="text-black" value="SM">Service maintenance</option>
      </select>
      <span className='absolute  right-4 top-1/2 z-10 mt-[-2px] h-[10px] w-[10px] -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-black'></span>
      </div>
                </div>
                <div className=" flex place-content-evenly">
                <button
              type="submit"
              className="w-1/3 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                    Confirmer
              </button>
              <button
              onClick = {() => SetStruct(false)} 
              className="w-1/3  bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
                Annuler</button>
              </div>
              </form>
                </div>

}

 <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-200">
              <th className="border text-black border-gray-700 px-4 py-2">Nom</th>
              <th className="border text-black border-gray-700 px-4 py-2">Prénom</th>
              <th className="border text-black border-gray-700 px-4 py-2">Email</th>
              <th className="border text-black border-gray-700 px-4 py-2">Rôle</th>
              <th className="border text-black border-gray-700 px-4 py-2">Structure</th>
            </tr>
          </thead>
          <tbody>
           
          </tbody>
        </table>
      </div>
    </div>


           </main>
         </div>
           
        </div>
    )
}