// app/page.jsx
"use client"; // Nécessaire pour useRouter
import React from "react";
import { useRouter } from "next/navigation";
import Header from "../header";
export default function HomePage() {
  // Renommé
  const router = useRouter();

  // Données statiques pour l'instant
  const vehicle = {
    marque: "Toyota",
    modele: "land cruiser",
    immatriculation: "7587956",
    annee: "2018",
  };

  const goToNext = () => {
    router.push("/demande/intervention/page1"); // Navigue vers la première page du formulaire
  };

  return (
    // Envelopper dans un conteneur pour centrer/appliquer des marges si nécessaire
    <div className="min-h-screen flex   items-center justify-center   p-6 bg-amber-50">
     <Header /> {/* Ajout de l'en-tête */}
      {/* Exemple de centrage */}
      <div className= "    text-blue-800  p-6 bg-white shadow-md rounded-xl  w-full max-w-2xl mx-auto lg:mt-10">
        <h2 className= " text-2xl font-semibold mb-4 ">
          Informations Véhicule  
        </h2>
        <div className="space-y-3 text-gray-700 ">
          <div>
            <strong className="text-black"> Marque :</strong> {vehicle.marque}
          </div>
          <div>
            <strong className="text-black">Modèle :</strong> {vehicle.modele}
          </div>
          <div>
            <strong className="text-black">Immatriculation :</strong> {vehicle.immatriculation}
          </div>
          <div>
            <strong className="text-black">Année :</strong> {vehicle.annee}
          </div>
        </div>

        <div className="mt-8 text-center">
          {" "}
          {/* Marge et centrage bouton */}
          <button
            onClick={goToNext}
            className=" bg-amber-200 text-black py-3 px-6 rounded hover:bg-amber-300 font-semibold shadow transition duration-150 ease-in-out border" // Style amélioré
          >
            Démarrer la demande
          </button>
        </div>
      </div>
    </div>
  );
}
