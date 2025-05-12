"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import {
  Building2,
  X,
  ChevronDown,
  Loader2,
  MapPin,
  CodeIcon,
  FileText,
  Building,
  Search,
  CheckCircle2,
} from "lucide-react"

import type { Structure } from "@/app/interfaces"

export default function FormStruct({ onClose }: { onClose?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<string>("District")
  const [isDisabled, setIsDisabled] = useState(true)
  const [dataDistrict, setDataDistrict] = useState<any[]>([])
  const [dataCentre, setDataCentre] = useState<any[]>([])
  const [selected, setSelected] = useState<Structure | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<any[]>([])
  const [filteredCentre, setFilteredCentre] = useState<any[]>([])
  const [notification, setNotification] = useState<{
    visible: boolean
    message: string
    type: "success" | "error"
  }>({ visible: false, message: "", type: "success" })
  const boxRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [FormValue, setFormValue] = useState({
    code_struct: "", // le code de la structure (a recevoir au backend)
    struct_parent_branche: "1",
    struct_parent: "", // le code de la structure parent
    designation: "", // nom de la structure (a recevoir au backend)
    type_struct: "", // type de la structure (a recevoir au backend)
    Code: "", // la codification supplementaire pour le centre
    wilaya: "", // la wilaya de la structure
    type_service: "1", // le type du service (a recevoir au backend maybe?)
  })

  const structure = [
    { id: "District", type_struct: "District" },
    { id: "Centre", type_struct: "Centre" },
    { id: "Service", type_struct: "Service" },
  ]

  const wilaya = [
    { id: "01", label: "Adrar" },
    { id: "02", label: "Chlef" },
    { id: "03", label: "Laghouat" },
    { id: "04", label: "Oum El Bouaghi" },
    { id: "05", label: "Batna" },
    { id: "06", label: "Béjaïa" },
    { id: "07", label: "Biskra" },
    { id: "08", label: "Béchar" },
    { id: "09", label: "Blida" },
    { id: "10", label: "Bouïra" },
    { id: "11", label: "Tamanrasset" },
    { id: "12", label: "Tébessa" },
    { id: "13", label: "Tlemcen" },
    { id: "14", label: "Tiaret" },
    { id: "15", label: "Tizi Ouzou" },
    { id: "16", label: "Alger" },
    { id: "17", label: "Djelfa" },
    { id: "18", label: "Jijel" },
    { id: "19", label: "Sétif" },
    { id: "20", label: "Saïda" },
    { id: "21", label: "Skikda" },
    { id: "22", label: "Sidi Bel Abbès" },
    { id: "23", label: "Annaba" },
    { id: "24", label: "Guelma" },
    { id: "25", label: "Constantine" },
    { id: "26", label: "Médéa" },
    { id: "27", label: "Mostaganem" },
    { id: "28", label: "M'Sila" },
    { id: "29", label: "Mascara" },
    { id: "30", label: "Ouargla" },
    { id: "31", label: "Oran" },
    { id: "32", label: "El Bayadh" },
    { id: "33", label: "Illizi" },
    { id: "34", label: "Bordj Bou Arreridj" },
    { id: "35", label: "Boumerdes" },
    { id: "36", label: "El Tarf" },
    { id: "37", label: "Tindouf" },
    { id: "38", label: "Tissemsilt" },
    { id: "39", label: "El Oued" },
    { id: "40", label: "Khenchela" },
    { id: "41", label: "Souk Ahras" },
    { id: "42", label: "Tipaza" },
    { id: "43", label: "Mila" },
    { id: "44", label: "Aïn Defla" },
    { id: "45", label: "Naâma" },
    { id: "46", label: "Aïn Témouchent" },
    { id: "47", label: "Ghardaïa" },
    { id: "48", label: "Relizane" },
    { id: "49", label: "Timimoun" },
    { id: "50", label: "Bordj Badji Mokhtar" },
    { id: "51", label: "Ouled Djellal" },
    { id: "52", label: "Béni Abbès" },
    { id: "53", label: "Aïn Salah" },
    { id: "54", label: "Aïn Guezzam" },
    { id: "55", label: "Touggourt" },
    { id: "56", label: "Djanet" },
    { id: "57", label: "El M'Ghair" },
    { id: "58", label: "El Meniaa" },
  ]

  const Code = [
    { id: "0", label: "0" },
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "4", label: "4" },
    { id: "5", label: "5" },
    { id: "6", label: "6" },
    { id: "7", label: "7" },
    { id: "8", label: "8" },
    { id: "9", label: "9" },
    { id: "A", label: "A" },
    { id: "B", label: "B" },
    { id: "C", label: "C" },
    { id: "D", label: "D" },
    { id: "E", label: "E" },
    { id: "F", label: "F" },
    { id: "G", label: "G" },
    { id: "H", label: "H" },
    { id: "I", label: "I" },
    { id: "J", label: "J" },
    { id: "K", label: "K" },
    { id: "L", label: "L" },
    { id: "M", label: "M" },
    { id: "N", label: "N" },
    { id: "O", label: "O" },
    { id: "P", label: "P" },
    { id: "Q", label: "Q" },
    { id: "R", label: "R" },
    { id: "S", label: "S" },
    { id: "T", label: "T" },
    { id: "U", label: "U" },
    { id: "V", label: "V" },
    { id: "W", label: "W" },
    { id: "X", label: "X" },
    { id: "Y", label: "Y" },
    { id: "Z", label: "Z" },
  ]

  const type_service = [
    { id: "1", label: "Service Transport" },
    { id: "2", label: "Service Maintenance" },
  ]

  const structure_parent = [
    { id: "3", label: "Branche GPL" },
    { id: "2", label: "Branche Commercialisation" },
    { id: "1", label: "Branche Carburant" },
  ]

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ visible: true, message, type })
    setTimeout(() => {
      setNotification({ visible: false, message: "", type: "success" })
    }, 5000)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
      setShowOptions(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // fonction pour rendre la codification supplementaire disabled
  useEffect(() => {
    if (selectedStructure === "District" || selectedStructure === "Service") {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [selectedStructure])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch("/api/structure/verifierStructures", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "District" }),
          }),
          fetch("/api/structure/verifierStructures", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({ type: "Centre" }),
          }),
        ])

        if (!res1.ok || !res2.ok) {
          throw new Error("Erreur lors de la récupération des structures")
        }

        const result1 = await res1.json()
        const result2 = await res2.json()
        setDataDistrict(result1)
        setDataCentre(result2)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        showNotification("Impossible de charger les structures existantes", "error")
      }
    }
    fetchData()
  }, [])

  //fonction pour filtrer les district
  useEffect(() => {
    const filtered = dataDistrict.filter(
      (item) =>
        item.designation?.toLowerCase().includes(FormValue.struct_parent.toLowerCase()) ||
        item.code_structure?.toLowerCase().includes(FormValue.struct_parent.toLowerCase()),
    )
    setFilteredOptions(filtered)
  }, [FormValue.struct_parent, dataDistrict])

  //fonction pour filtrer les centres
  useEffect(() => {
    const filtered = dataCentre.filter(
      (item) =>
        item.designation?.toLowerCase().includes(FormValue.struct_parent.toLowerCase()) ||
        item.code_structure?.toLowerCase().includes(FormValue.struct_parent.toLowerCase()),
    )
    setFilteredCentre(filtered)
  }, [FormValue.struct_parent, dataCentre])

  const handleSelect = (option: Structure) => {
    setSelected(option)
    setFormValue((prev) => ({
      ...prev,
      struct_parent: option.code_structure,
    }))
    setShowOptions(false)
  }

  const handleChangeStruct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStructure(e.target.value)
    setFormValue((prev) => ({
      ...prev,
      struct_parent: "",
    }))
  }

  // fonction pour update les valeurs
  const handleValues = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // fonction pour recevoir le form
  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!FormValue.designation.trim()) {
        throw new Error("La désignation est obligatoire")
      }

      if (selectedStructure !== "Service" && !FormValue.wilaya) {
        throw new Error("Veuillez sélectionner une wilaya")
      }

      if ((selectedStructure === "Centre" || selectedStructure === "Service") && !FormValue.struct_parent) {
        throw new Error("La structure parent est obligatoire")
      }

      if (selectedStructure === "Centre" && !FormValue.Code) {
        throw new Error("La codification supplémentaire est obligatoire pour un Centre")
      }

      // Génération du code de structure
      FormValue.type_struct = selectedStructure
      switch (FormValue.type_struct) {
        case "District":
          FormValue.code_struct = FormValue.struct_parent_branche + FormValue.wilaya
          FormValue.struct_parent = FormValue.struct_parent_branche
          break
        case "Centre":
          FormValue.code_struct = FormValue.struct_parent[0] + FormValue.wilaya + FormValue.Code
          break
        case "Service":
          FormValue.code_struct = FormValue.struct_parent + FormValue.type_service
          break
      }

      const struct: Structure = {
        code_structure: FormValue.code_struct,
        code_struture_hierachique: FormValue.struct_parent,
        designation: FormValue.designation,
        type_structure_hierachique: FormValue.type_struct,
      }
      console.log("Struct to send:", struct);
      
      const response = await fetch("/api/structure/ajouterStructure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(struct),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message|| "structure déjà existante" )
      }

      showNotification("Structure ajoutée avec succès!", "success")

      // Réinitialiser le formulaire
      if (formRef.current) {
        formRef.current.reset()
      }

      // Fermer le modal après un court délai
      setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 1500)
    } catch (error: any) {
      console.error("Erreur:", error)
      showNotification(error.message || "Une erreur s'est produite", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getStructureIcon = () => {
    switch (selectedStructure) {
      case "District":
        return <Building2 className="h-5 w-5 text-indigo-500" />
      case "Centre":
        return <Building className="h-5 w-5 text-indigo-500" />
      case "Service":
        return <FileText className="h-5 w-5 text-indigo-500" />
      default:
        return <Building2 className="h-5 w-5 text-indigo-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        {/* Notification */}
        {notification.visible && (
          <div
            className={`absolute top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
              notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleForm} className="relative">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStructureIcon()}
                <h3 className="text-lg font-medium text-gray-900">Ajouter une {selectedStructure.toLowerCase()}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-5 space-y-6">
            {/* Structure Type Selector */}
            <div className="grid grid-cols-3 gap-3">
              {structure.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStructure(item.id)}
                  className={`flex flex-col items-center justify-center px-4 py-3 border rounded-lg transition-all ${
                    selectedStructure === item.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {item.id === "District" && <Building2 className="h-5 w-5 mb-1" />}
                  {item.id === "Centre" && <Building className="h-5 w-5 mb-1" />}
                  {item.id === "Service" && <FileText className="h-5 w-5 mb-1" />}
                  <span className="text-sm font-medium">{item.type_struct}</span>
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Designation */}
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                  Désignation <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={FormValue.designation}
                    onChange={handleValues}
                    placeholder="Nom de la structure"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Wilaya or Service Type */}
              {selectedStructure !== "Service" ? (
                <div>
                  <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-1">
                    Wilaya <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="wilaya"
                      name="wilaya"
                      value={FormValue.wilaya}
                      onChange={handleValues}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                    >
                      <option value="" disabled>
                        Choisissez une Wilaya
                      </option>
                      {wilaya.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} ({item.id})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="type_service" className="block text-sm font-medium text-gray-700 mb-1">
                    Type du service <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="type_service"
                      name="type_service"
                      value={FormValue.type_service}
                      onChange={handleValues}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                    >
                      {type_service.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Structure */}
              {selectedStructure === "District" && (
                <div>
                  <label htmlFor="struct_parent_branche" className="block text-sm font-medium text-gray-700 mb-1">
                    Structure parent <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="struct_parent_branche"
                      name="struct_parent_branche"
                      value={FormValue.struct_parent_branche}
                      onChange={handleValues}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                    >
                      {structure_parent.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {selectedStructure === "Centre" && (
                <div>
                  <label htmlFor="struct_parent" className="block text-sm font-medium text-gray-700 mb-1">
                    Structure parent <span className="text-red-500">*</span>
                  </label>
                  <div ref={boxRef} className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="struct_parent"
                      name="struct_parent"
                      placeholder="Rechercher par code ou nom"
                      onFocus={() => setShowOptions(true)}
                      onChange={handleValues}
                      value={FormValue.struct_parent}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {showOptions && (
                      <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => (
                            <li
                              key={option.code_structure}
                              onClick={() => handleSelect(option)}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <Building2 className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium block truncate">{option.designation}</span>
                              </div>
                              <span className="text-xs text-gray-500 ml-6 pl-2">{option.code_structure}</span>
                            </li>
                          ))
                        ) : (
                          <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                            Aucun district trouvé
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedStructure === "Service" && (
                <div>
                  <label htmlFor="struct_parent" className="block text-sm font-medium text-gray-700 mb-1">
                    Structure parent <span className="text-red-500">*</span>
                  </label>
                  <div ref={boxRef} className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="struct_parent"
                      name="struct_parent"
                      placeholder="Rechercher par code ou nom"
                      onFocus={() => setShowOptions(true)}
                      onChange={handleValues}
                      value={FormValue.struct_parent}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {showOptions && (
                      <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredCentre.length > 0 ? (
                          filteredCentre.map((option) => (
                            <li
                              key={option.code_structure}
                              onClick={() => handleSelect(option)}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <Building className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium block truncate">{option.designation}</span>
                              </div>
                              <span className="text-xs text-gray-500 ml-6 pl-2">{option.code_structure}</span>
                            </li>
                          ))
                        ) : (
                          <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                            Aucun centre trouvé
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Code supplémentaire */}
              <div>
                <label htmlFor="Code" className="block text-sm font-medium text-gray-700 mb-1">
                  Codification supplémentaire
                  {!isDisabled && <span className="text-red-500"> *</span>}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CodeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="Code"
                    name="Code"
                    disabled={isDisabled}
                    value={FormValue.Code}
                    onChange={handleValues}
                    required={!isDisabled}
                    className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none ${
                      isDisabled ? "bg-gray-100 text-gray-500" : ""
                    }`}
                  >
                    <option value="" disabled>
                      Veuillez choisir
                    </option>
                    {Code.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {selectedStructure === "Centre" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Ce code sera utilisé pour générer le code de structure unique
                  </p>
                )}
              </div>
            </div>

            {/* Preview Code */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Aperçu du code de structure
              </h4>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-white px-3 py-1.5 border border-gray-300 rounded-md flex-grow">
                  {selectedStructure === "District" && FormValue.struct_parent_branche && FormValue.wilaya
                    ? `${FormValue.struct_parent_branche}${FormValue.wilaya}`
                    : selectedStructure === "Centre" && FormValue.struct_parent && FormValue.wilaya && FormValue.Code
                      ? `${FormValue.struct_parent[0]}${FormValue.wilaya}${FormValue.Code}`
                      : selectedStructure === "Service" && FormValue.struct_parent && FormValue.type_service
                        ? `${FormValue.struct_parent}${FormValue.type_service}`
                        : "..."}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Traitement...
                </>
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
