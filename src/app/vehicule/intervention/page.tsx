import { redirect } from "next/navigation"
import { getUserFromToken } from "@/app/dashboard/auth"
import InterventionList from "./intervention-list"

export default async function InterventionPage({
  searchParams,
}: {
  searchParams: { code_vehicule?: string }
}) {
  const user = await getUserFromToken()

  if (!user) redirect("/login")

  const { code_vehicule } = searchParams

  if (!code_vehicule) {
    redirect("/vehicule")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Demandes d'intervention</h1>
      <p className="text-gray-600 mb-6">
        Véhicule: <span className="font-semibold">{code_vehicule}</span>
      </p>
      <InterventionList code_vehicule={code_vehicule} userId={user.id_utilisateur} userPrivs={user.droit_utilisateur.split('/')} />
    </div>
  )
}
