import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import TypesTable from "./afficher-type";
export default async function Type() {
    const user = await getUserFromToken();
      if (!user) {
        redirect("/login");
      }
      return <TypesTable userId={user?.id_utilisateur} userPrivs ={user?.droit_utilisateur.split('/')} />
}