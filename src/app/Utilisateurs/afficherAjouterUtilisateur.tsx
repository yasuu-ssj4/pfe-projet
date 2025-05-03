"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Utilisateurid } from "@/app/interfaces"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
} from "lucide-react"
import FormStruct from "./form-struct"

export default function Compte({ userId }: { userId: number }) {
  const [popup, setPopup] = useState(false)
  const [struct, setStruct] = useState(false)
  const [step, setStep] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editUserId, setEditUserId] = useState<number | null>(null)

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
    droit_acces: "",
    role: "DG",
  })

  const [role, setRole] = useState("Direction generale")
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [structureFilter, setStructureFilter] = useState("")
  const [users, setUsers] = useState<Utilisateurid[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Utilisateurid[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Add this debugging function at the top of the component, right after the useState declarations
  const debugLog = (message: string, data: any) => {
    console.log(`DEBUG - ${message}:`, data)
  }

  // Fetch users de L'API
  const fetchUsers = async () => {
    setIsTableLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/utilisateur/getUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la récupération des utilisateurs")
      }

      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des utilisateurs")
      showAlert("error", "Erreur lors de la récupération des utilisateurs. Veuillez réessayer.")
    } finally {
      setIsTableLoading(false)
    }
  }

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters when search term or filters change
  useEffect(() => {
    // Apply filters to the users array
    let results = [...users]

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (user) =>
          user.nom_utilisateur?.toLowerCase().includes(term) ||
          user.prenom_utilisateur?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term),
      )
    }

    // Apply role filter
    if (roleFilter) {
      results = results.filter((user) => user.role === roleFilter)
    }

    // Apply structure filter
    if (structureFilter) {
      results = results.filter((user) => user.code_structure === structureFilter)
    }

    setFilteredUsers(results)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [searchTerm, roleFilter, structureFilter, users])

  const handleForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePopup = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCheckedItems([])
    setFormValue({
      nom: "",
      prenom: "",
      email: "",
      tel: "",
      username: "",
      password: "",
      structure: "",
      droit_acces: "",
      role: "DG",
      authType: "BDD",
      est_admin: false,
    })
    setIsEditMode(false)
    setEditUserId(null)
    setPopup(true)
    setStep(1)
  }

  // Replace the handleEditUser function with this enhanced version
  const handleEditUser = async (user: Utilisateurid) => {
    debugLog("Original user data from API", user)
    setIsEditMode(true)
    setEditUserId(user.id_utilisateur)

    // Parse the droit_utilisateur string into an array of privileges
    const privileges = user.droit_utilisateur ? user.droit_utilisateur.split("/") : []
    setCheckedItems(privileges)

    // Explicitly handle the phone number, ensuring it's not null or undefined
    const phoneNumber = user.numero_telephone 
    debugLog("Phone number extracted", phoneNumber)

    const formData = {
      nom: user.nom_utilisateur || "",
      prenom: user.prenom_utilisateur || "",
      email: user.email || "",
      tel: phoneNumber, 
      username: user.username || "",
      password: "", // Don't set the password for security reasons
      structure: user.code_structure || "",
      droit_acces: user.droit_utilisateur || "",
      role: user.role || "DG",
      authType: user.methode_authent || "BDD",
      est_admin: user.est_admin || false,
    }

    debugLog("Form data being set", formData)
    setFormValue(formData)

    setPopup(true)
    setStep(1)
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/utilisateur/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de l'utilisateur")
      }

      showAlert("success", "Utilisateur supprimé avec succès")
      fetchUsers() // Refresh the user list
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur")
      showAlert("error", err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Skip validation if we're in edit mode
      if (isEditMode) {
        setStep(2)
        setIsLoading(false)
        return
      }

      setStep(2)
      setIsLoading(false)
      return

      const res = await fetch("/api/utilisateur/validerUser", {
        method: "POST",
        body: JSON.stringify({
          username: formValue.username,
          code_structure: formValue.structure,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur de validation")
      }

      console.log("Validation réussie !")
      setStep(2)
    } catch (err) {
      console.error("Erreur lors de la validation:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la validation")
      showAlert("error", err instanceof Error ? err.message : "Erreur lors de la validation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value)
  }

  // Replace the handleUser function with this enhanced version
  const handleUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const selectedPrivileges = checkedItems
    const privs = selectedPrivileges.join("/")
    formValue.droit_acces = privs

    // Ensure phone number is properly handled
    const phoneNumber = formValue.tel || null
    debugLog("Phone number being sent", phoneNumber)

    const user: Utilisateurid = {
      id_utilisateur: isEditMode && editUserId ? editUserId : null,
      nom_utilisateur: formValue.nom,
      prenom_utilisateur: formValue.prenom,
      username: formValue.username,
      email: formValue.email,
      numero_telephone : phoneNumber || formValue.tel , 
      mot_de_passe: formValue.password,
      code_structure: formValue.structure,
      methode_authent: formValue.authType,
      est_admin: formValue.est_admin,
      droit_utilisateur: formValue.droit_acces,
      role: formValue.role,
    }

    debugLog("Complete user data being sent to API", user)

    try {
      const endpoint = isEditMode ? "/api/utilisateur/updateUser" : "/api/utilisateur/ajouterUser"
      debugLog("Sending request to endpoint", endpoint)

      const res2 = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })

      if (!res2.ok) {
        const error = await res2.json()
        throw new Error(error.error || `Erreur lors de ${isEditMode ? "la modification" : "l'ajout"} de l'utilisateur`)
      }

      const data = await res2.json()
      debugLog("Response from API", data)

      console.log(`Utilisateur ${isEditMode ? "modifié" : "ajouté"} avec succès:`, data)
      showAlert("success", `Utilisateur ${isEditMode ? "modifié" : "ajouté"} avec succès!`)

      // Close popup and refresh user list
      setPopup(false)
      fetchUsers()
    } catch (err) {
      console.error(`Erreur lors de ${isEditMode ? "la modification" : "l'ajout"} de l'utilisateur:`, err)
      setError(
        err instanceof Error
          ? err.message
          : `Erreur lors de ${isEditMode ? "la modification" : "l'ajout"} de l'utilisateur`,
      )
      showAlert(
        "error",
        err instanceof Error
          ? err.message
          : `Erreur lors de ${isEditMode ? "la modification" : "l'ajout"} de l'utilisateur`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target

    if (id === "admin") {
      setFormValue((prev) => ({ ...prev, est_admin: checked }))
      setCheckedItems(checked ? privilege.map((opt) => opt.id) : [])
    } else {
      setCheckedItems((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)))
    }
  }

  // Alert notification system
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  })

  const showAlert = (type: "success" | "error" | "info" | "warning", message: string) => {
    setAlert({ visible: true, message, type })
    setTimeout(() => {
      setAlert({ visible: false, message: "", type: "success" })
    }, 5000)
  }

  // Get unique structures for filter dropdown
  const uniqueStructures = Array.from(new Set(users.map((user) => user.code_structure))).filter(Boolean) as string[]

  // Get unique roles for filter dropdown with display names
  const roleOptions = [
    { value: "DG", label: "Direction générale" },
    { value: "branche", label: "Branche" },
    { value: "district", label: "District" },
    { value: "centre", label: "Centre" },
    { value: "ST", label: "Service transport" },
    { value: "SM", label: "Service maintenance" },
  ]

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("")
    setStructureFilter("")
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get current users for pagination
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const privilege = [
    { id: "admin", label: "Admin" },
    { id: "user", label: "Compte Utilisateur" },
    { id: "ajouter_user", label: "Ajouter Un Utilisateur" },
    { id: "modifier_user", label: "Modifier Un Utilisateur" },
    { id: "supprimer_user", label: "Supprimer Un Utilisateur" },
    { id: "struct", label: "Structure" },
    { id: "ajouter_structure", label: "Ajouter Une Structure" },
    { id: "modifier_structure", label: "Modifier Une Structure" },
    { id: "supprimer_structure", label: "Supprimer Une Structure" },
    { id: "vehicule", label: "Véhicule" },
    { id: "ajout_vehicule", label: "Ajouter Un Véhicule" },
    { id: "modifier_vehicule", label: "Modifier Un Véhicule" },
    { id: "supprimer_vehicule", label: "Supprimer Un Véhicule" },
    { id: "ajouter_DI", label: "Ajouter la Demande d'intervention" },
    { id: "ajouter_QI", label: "Ajouter la qualification d'intervention " },
    { id: "modifier_QI", label: "Modifier la qualification d'intervention" },
    { id: "modifier_DI", label: "Modifier la Demande d'intervention" },
    { id: "supprimer_DI", label: "Supprimer la Demande d'intervention" },
    { id: "demande", label: "Demande" },
    { id: "rapport", label: "Rapport" },
    { id: "ajouter_rapport", label: "Ajouter Rapport" },
    { id: "supprimer_rapport", label: "Supprimer Rapport" },
    { id: "programme_entretien", label: "Programme Entretien" },
    { id: "ajouter_programme_entretien", label: "Ajouter Programme Entretien" },
    { id: "supprimer_programme_entretien", label: "Supprimer Programme Entretien" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Notification */}
      {alert.visible && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : alert.type === "error"
                ? "bg-red-500 text-white"
                : alert.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
          }`}
        >
          {alert.type === "success" && <Check className="w-5 h-5 mr-2" />}
          {alert.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
          {alert.type === "warning" && <AlertCircle className="w-5 h-5 mr-2" />}
          {alert.type === "info" && <AlertCircle className="w-5 h-5 mr-2" />}
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert({ ...alert, visible: false })}
            className="ml-3 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 pt min-h-screen">
        <main className="w-full h-full flex-1 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStruct(true)}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter une structure</span>
                </button>
                <button
                  onClick={handlePopup}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Ajouter un compte</span>
                </button>
              </div>
            </div>

            {/* User Table with Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">Liste des Utilisateurs</h2>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-grow md:max-w-xs">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Tous les rôles</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Structure Filter */}
                    <div className="relative">
                      <select
                        value={structureFilter}
                        onChange={(e) => setStructureFilter(e.target.value)}
                        className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Toutes les structures</option>
                        {uniqueStructures.map((structure) => (
                          <option key={structure} value={structure}>
                            {structure}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(searchTerm || roleFilter || structureFilter) && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Effacer
                      </button>
                    )}

                    {/* Refresh Button */}
                    <button
                      onClick={fetchUsers}
                      disabled={isTableLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isTableLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Actualiser
                    </button>
                  </div>
                </div>

                {/* Filter Status */}
                {(searchTerm || roleFilter || structureFilter) && (
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <span className="mr-2">Filtres actifs:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                        Recherche: {searchTerm}
                      </span>
                    )}
                    {roleFilter && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                        Rôle: {roleOptions.find((r) => r.value === roleFilter)?.label}
                      </span>
                    )}
                    {structureFilter && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Structure: {structureFilter}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nom
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Prénom
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rôle
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Structure
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isTableLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-indigo-500 mb-4 animate-spin" />
                            <p className="text-lg font-medium">Chargement des utilisateurs...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-lg font-medium text-red-500">
                              Erreur lors du chargement des utilisateurs
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{error}</p>
                            <button
                              onClick={fetchUsers}
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Réessayer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <UserPlus className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {searchTerm || roleFilter || structureFilter
                                ? "Essayez de modifier vos filtres"
                                : "Ajoutez des utilisateurs pour les voir apparaître ici"}
                            </p>
                            {(searchTerm || roleFilter || structureFilter) && (
                              <button
                                onClick={clearFilters}
                                className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Effacer les filtres
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.nom_utilisateur}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.prenom_utilisateur}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {roleOptions.find((r) => r.value === user.role)?.label || user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.code_structure}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                              onClick={() => handleDeleteUser(user.id_utilisateur!)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                      Affichage de {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} sur{" "}
                      {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""}
                      {searchTerm || roleFilter || structureFilter ? " (filtrés)" : ""}
                    </div>

                    <div className="flex items-center">
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Précédent</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Logic to show pages around current page
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Suivant</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditMode
                        ? step === 1
                          ? "Modifier un utilisateur"
                          : "Modifier les privilèges"
                        : step === 1
                          ? "Créer un utilisateur"
                          : "Sélectionner les privilèges"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPopup(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Error message in form */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          id="nom"
                          name="nom"
                          value={formValue.nom}
                          onChange={handleForm}
                          type="text"
                          placeholder="Nom"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          id="prenom"
                          name="prenom"
                          value={formValue.prenom}
                          onChange={handleForm}
                          type="text"
                          placeholder="Prénom"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          value={formValue.email}
                          onChange={handleForm}
                          type="email"
                          placeholder="Email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de téléphone
                        </label>
                        <input
                          id="tel"
                          name="tel"
                          type="text"
                          value={formValue.tel}
                          onChange={handleForm}
                          placeholder="Numéro de téléphone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom d'utilisateur
                        </label>
                        <input
                          id="username"
                          name="username"
                          value={formValue.username}
                          onChange={handleForm}
                          placeholder="Nom d'utilisateur"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          readOnly={isEditMode} // Username cannot be changed in edit mode
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          {isEditMode ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                        </label>
                        <input
                          id="password"
                          name="password"
                          value={formValue.password}
                          onChange={handleForm}
                          type="password"
                          placeholder={isEditMode ? "Nouveau mot de passe" : "Mot de passe"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="structure" className="block text-sm font-medium text-gray-700 mb-1">
                          Structure
                        </label>
                        <input
                          id="structure"
                          name="structure"
                          value={formValue.structure}
                          onChange={handleForm}
                          type="text"
                          placeholder="Code de la structure"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Rôle
                        </label>
                        <div className="relative">
                          <select
                            id="role"
                            name="role"
                            value={formValue.role}
                            onChange={handleForm}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black appearance-none"
                          >
                            <option value="DG">Direction générale</option>
                            <option value="branche">Branche</option>
                            <option value="district">District</option>
                            <option value="centre">Centre</option>
                            <option value="ST">Service transport</option>
                            <option value="SM">Service maintenance</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type d'authentification</label>
                        <div className="flex space-x-6">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="authType"
                              value="BDD"
                              checked={formValue.authType === "BDD"}
                              onChange={handleForm}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Base de données</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="authType"
                              value="AD"
                              checked={formValue.authType === "AD"}
                              onChange={handleForm}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Active Directory</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-base font-medium text-gray-900 mb-4">Sélection des privilèges</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {privilege.map((option) => (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={`flex items-center p-3 rounded-md border ${
                                checkedItems.includes(option.id)
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-300 hover:bg-gray-50"
                              } transition-colors duration-200 cursor-pointer`}
                            >
                              <input
                                type="checkbox"
                                id={option.id}
                                name="privilege"
                                value={option.id}
                                checked={checkedItems.includes(option.id)}
                                onChange={handleItems}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {step === 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          "Suivant"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPopup(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          "Confirmer"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Retour
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Structure Modal - Using the FormStruct component */}
      {struct && <FormStruct onClose={() => setStruct(false)} />}
    </div>
  )
}
