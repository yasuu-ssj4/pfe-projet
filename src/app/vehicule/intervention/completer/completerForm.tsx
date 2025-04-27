"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle } from "lucide-react"

type CompleterFormProps = {
  id_demande_intervention: string
  demandeInfo: any
}

export default function CompleterForm({ id_demande_intervention, demandeInfo }: CompleterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    constat_panne: demandeInfo?.constat_panne || "",
    diagnostique: demandeInfo?.diagnostique || "",
    niveaux_prio: demandeInfo?.niveaux_prio || 1,
    necess_permis: demandeInfo?.necess_permis || false,
    routinier: demandeInfo?.routinier || false,
    routinier_ref: demandeInfo?.routinier_ref || "",
    dangereux: demandeInfo?.dangereux || false,
    dangereux_ref: demandeInfo?.dangereux_ref || "",
    nom_prenom_responsable: demandeInfo?.nom_prenom_responsable || "",
    fonction_responsable: demandeInfo?.fonction_responsable || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/intervention/completerDemande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_demande_intervention,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la complétion de la demande")
      }

      setSuccess("Demande d'intervention complétée avec succès")
      setTimeout(() => {
        router.push(`/vehicule/intervention?code_vehicule=${demandeInfo.code_vehicule}`)
      }, 2000)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de la demande</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Code véhicule</label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">{demandeInfo.code_vehicule}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de la demande</label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">
              {new Date(demandeInfo.date_application).toLocaleDateString("fr-FR")}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nature de la panne</label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">{demandeInfo.nature_panne}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Degré d'urgence</label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">{demandeInfo.degre_urgence}</div>
          </div>
          {demandeInfo.description && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md whitespace-pre-wrap">{demandeInfo.description}</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="constat_panne" className="block text-sm font-medium text-gray-700">
            Constat de la panne
          </label>
          <textarea
            id="constat_panne"
            name="constat_panne"
            value={formData.constat_panne}
            onChange={handleChange}
            rows={4}
            placeholder="Décrivez votre constat de la panne"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="diagnostique" className="block text-sm font-medium text-gray-700">
            Diagnostic
          </label>
          <textarea
            id="diagnostique"
            name="diagnostique"
            value={formData.diagnostique}
            onChange={handleChange}
            rows={4}
            placeholder="Fournissez un diagnostic de la panne"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="niveaux_prio" className="block text-sm font-medium text-gray-700">
            Niveau de priorité
          </label>
          <select
            id="niveaux_prio"
            name="niveaux_prio"
            value={formData.niveaux_prio}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">1 - Faible</option>
            <option value="2">2 - Normal</option>
            <option value="3">3 - Élevé</option>
            <option value="4">4 - Urgent</option>
            <option value="5">5 - Critique</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="necess_permis"
            name="necess_permis"
            type="checkbox"
            checked={formData.necess_permis}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="necess_permis" className="ml-2 block text-sm text-gray-900">
            Nécessite un permis de travail
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="routinier"
            name="routinier"
            type="checkbox"
            checked={formData.routinier}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="routinier" className="ml-2 block text-sm text-gray-900">
            Travail routinier
          </label>
        </div>

        {formData.routinier && (
          <div>
            <label htmlFor="routinier_ref" className="block text-sm font-medium text-gray-700">
              Référence du travail routinier
            </label>
            <input
              type="text"
              id="routinier_ref"
              name="routinier_ref"
              value={formData.routinier_ref}
              onChange={handleChange}
              placeholder="Référence"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            id="dangereux"
            name="dangereux"
            type="checkbox"
            checked={formData.dangereux}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="dangereux" className="ml-2 block text-sm text-gray-900">
            Travail dangereux
          </label>
        </div>

        {formData.dangereux && (
          <div>
            <label htmlFor="dangereux_ref" className="block text-sm font-medium text-gray-700">
              Référence du travail dangereux
            </label>
            <input
              type="text"
              id="dangereux_ref"
              name="dangereux_ref"
              value={formData.dangereux_ref}
              onChange={handleChange}
              placeholder="Référence"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="nom_prenom_responsable" className="block text-sm font-medium text-gray-700">
            Nom et prénom du responsable
          </label>
          <input
            type="text"
            id="nom_prenom_responsable"
            name="nom_prenom_responsable"
            value={formData.nom_prenom_responsable}
            onChange={handleChange}
            placeholder="Nom et prénom"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="fonction_responsable" className="block text-sm font-medium text-gray-700">
            Fonction du responsable
          </label>
          <input
            type="text"
            id="fonction_responsable"
            name="fonction_responsable"
            value={formData.fonction_responsable}
            onChange={handleChange}
            placeholder="Fonction"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Compléter la demande"
          )}
        </button>
      </div>
    </form>
  )
}
