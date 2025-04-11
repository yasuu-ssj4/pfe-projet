// components/RadioGroup.jsx
"use client";

import React from "react";

const RadioGroup = ({
  name,
  options,
  label,
  disabled,
  formData,
  updateField,
}) => {
  // Vérification essentielle : formData doit toujours être là pour afficher l'état coché.
  if (!formData) {
    console.error(`RadioGroup "${name}" is missing formData prop.`);
    // Peut-être retourner null ou un message d'erreur plus discret
    return (
      <div className="text-red-500 text-xs">
        Erreur: Données manquantes pour {name}
      </div>
    );
  }

  // Vérifier updateField SEULEMENT si le composant N'EST PAS désactivé
  if (!disabled && typeof updateField !== "function") {
    console.warn(
      `RadioGroup "${name}" is interactive but missing updateField function.`
    );
    // On pourrait choisir de le rendre désactivé visuellement pour éviter la confusion
    // disabled = true; // Forcer désactivé si updateField manque
    // Ou juste afficher un avertissement et continuer (peut causer des clics sans effet)
  }

  const handleRadioChange = (e) => {
    // Appeler updateField seulement s'il existe et que le composant n'est pas désactivé
    if (!disabled && updateField) {
      updateField(name, e.target.value);
    }
  };

  return (
    <div>
      {/* Ajouter une vérification pour le label */}
      {label && (
        <label className="block mb-2 font-medium text-gray-700 text-sm">
          {label} :
        </label>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* Ajouter une vérification pour les options */}
        {options && options.length > 0 ? (
          options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-1 ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                // Donner un nom unique dynamique si name n'est pas fourni ou pour éviter conflits
                name={name || `radio-group-${Math.random()}`}
                value={option.value}
                checked={formData[name] === option.value}
                onChange={handleRadioChange}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50" // Style Tailwind pour désactivé aussi
                disabled={disabled}
              />
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))
        ) : (
          <span className="text-xs text-gray-500">Aucune option fournie.</span>
        )}
      </div>
    </div>
  );
};

export default RadioGroup;
