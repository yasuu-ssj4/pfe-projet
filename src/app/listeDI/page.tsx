import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import ListDIPage from "./listdi";

export default async function DashboardPage() {
  const user = await getUserFromToken();
  if (!user) {
    redirect("/login");
  }

  return <ListDIPage
   userId={user.id_utilisateur}
   userPrivs={user.droit_utilisateur.split('/')}
    />;
}