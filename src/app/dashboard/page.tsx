// app/dashboard/page.tsx
import { getUserFromToken } from "./auth";
import { redirect } from "next/navigation";
import UsersPage from "./UsersPageClient"; 

export default async function DashboardPage() {
  const user = await getUserFromToken();
  if (!user) {
    redirect("/login");
  }

  return <UsersPage
   userId={user.id_utilisateur}
   userPrivs={user.droit_utilisateur.split('/')}
    />;
}