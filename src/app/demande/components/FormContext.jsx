// components/FormContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const FormContext = createContext();

export const useFormData = () => useContext(FormContext);

// Liste exhaustive des clés attendues dans le formulaire final
const defaultKeys = {
  num: "",
  datePanne: "",
  heurePanne: "",
  district: "",
  cds: "",
  structureMaint: "",
  activite: "",
  naturePanne: "",
  natureTravaux: "",
  urgence: "",
  code: "",
  genre: "",
  marque: "",
  kmHeures: "",
  type: "",
  constatPanne: "",
  nomDemandeur: "",
  fonctionDemandeur: "",
  dateDemandeur: "",
  visaDemandeur: "",
  nomResponsable: "",
  fonctionResponsable: "",
  dateResponsable: "",
  visaResponsable: "",
  diagnostic: "",
  natureTravauxDesc: "",
  priorite: "",
  permisTravail: false,
  routRef: "",
  danRef: "",
  nomPrenom: "",
  fonction: "",
  date: "",
  visahse: "",
  nomIntervenant: "",
  fonctionIntervenant: "",
  dateIntervenant: "",
  visaHSE: "",
  nomResponsableMaint: "",
  fonctionResponsableMaint: "",
  dateResponsableMaint: "",
  visaResponsableMaint: "",
  // Ajouter d'autres clés si nécessaire (ex: structureDetail)
  structureDetail: "",
};

export const FormProvider = ({ children }) => {
  const getInitialFormData = () => {
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem("formData");
        // Fusionne les données sauvegardées avec les clés par défaut pour s'assurer que toutes existent
        return savedData
          ? { ...defaultKeys, ...JSON.parse(savedData) }
          : { ...defaultKeys };
      } catch (error) {
        console.error("Error parsing formData from localStorage", error);
        return { ...defaultKeys }; // Retourne les défauts en cas d'erreur
      }
    }
    return { ...defaultKeys }; // Retourne les défauts côté serveur
  };

  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("formData", JSON.stringify(formData));
        // console.log("Updated context & localStorage:", formData); // Décommenter pour debug
      } catch (error) {
        console.error("Error saving formData to localStorage", error);
      }
    }
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => {
      // Vérifie si la clé existe dans les clés par défaut avant de mettre à jour
      // Évite d'ajouter des clés non prévues au state
      if (Object.prototype.hasOwnProperty.call(defaultKeys, field)) {
        return { ...prev, [field]: value };
      } else {
        console.warn(`Attempted to update non-existent field: ${field}`);
        return prev; // Ne modifie pas l'état si la clé n'est pas prévue
      }
    });
  };

  // Fonction pour mettre à jour plusieurs champs à la fois (utile pour Vehicule.jsx)
  const updateMultipleFields = (dataObject) => {
    setFormData((prev) => {
      const updated = { ...prev };
      let hasChanged = false;
      for (const field in dataObject) {
        if (Object.prototype.hasOwnProperty.call(defaultKeys, field)) {
          if (updated[field] !== dataObject[field]) {
            updated[field] = dataObject[field];
            hasChanged = true;
          }
        } else {
          console.warn(`Attempted to update non-existent field: ${field}`);
        }
      }
      return hasChanged ? updated : prev;
    });
  };

  return (
    // Fournir updateMultipleFields également si nécessaire
    <FormContext.Provider
      value={{ formData, updateField, updateMultipleFields }}
    >
      {children}
    </FormContext.Provider>
  );
};
