import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import ListRIPage from "./listri";

export default async function DashboardPage() {
  const user = await getUserFromToken();
  if (!user) {
    redirect("/login");
  }
return <ListRIPage

 userId={user.id_utilisateur}
   userPrivs={user.droit_utilisateur.split('/')}
    />;

}
