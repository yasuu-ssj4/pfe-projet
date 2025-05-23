import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import StructuresTable from "./structure-table";
export default async function Structure() {
    const user = await getUserFromToken();
      if (!user) {
        redirect("/login");
      }
      return <StructuresTable userId={user.id_utilisateur} userPrivs={user.droit_utilisateur.split('/')} />
}