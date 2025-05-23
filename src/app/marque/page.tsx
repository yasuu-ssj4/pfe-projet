import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import MarquesTable from "./afficher-marque";

export default async function Marque(){
  const user = await getUserFromToken();
  if (!user) {
    redirect("/login");
  }
    return (
        <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des marques</h1>
              <MarquesTable userId={user.id_utilisateur} userPrivs={user.droit_utilisateur.split('/')}/>
            </div>
    )
}