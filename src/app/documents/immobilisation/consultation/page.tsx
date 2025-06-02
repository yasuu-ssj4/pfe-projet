import { getUserFromToken } from "@/app/dashboard/auth";
import { redirect } from "next/navigation";
import HistoriqueImmobilisationPage from "./consultation";
export default async function Type() {
    const user = await getUserFromToken();
      if (!user) {
        redirect("/login");
      }
      return <HistoriqueImmobilisationPage userId={user?.id_utilisateur} userPrivs ={user?.droit_utilisateur.split('/')} />
}