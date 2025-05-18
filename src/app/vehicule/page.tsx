import FormVehicule from "./formVehicules"
import AfficheVehicule from "./afficherVehicule"
import { getUserFromToken } from "../dashboard/auth"
import { redirect } from "next/navigation"

export default async function Vehicule() {
  const user = await getUserFromToken()
  console.log("user", user)

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-1 pt min-h-screen">
        <main className="w-full h-full flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-2 mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Véhicules</h1>
              <FormVehicule userPrivs={user.droit_utilisateur.split('/')} />
            </div>
            <AfficheVehicule userId={user.id_utilisateur} userPrivs={user.droit_utilisateur.split('/')} />
          </div>
        </main>
      </div>
    </div>
  )
}
