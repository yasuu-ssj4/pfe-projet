import { getUserFromToken } from "../dashboard/auth";
import { redirect } from "next/navigation";
import RapportActivitePage from "./RapportPage";

export default async function DashboardPage() {
  const user = await getUserFromToken();
  if (!user) {
    redirect("/login");
  }
return <RapportActivitePage

 userId={user.id_utilisateur}
   userPrivs={user.droit_utilisateur.split('/')}
    />;

}
