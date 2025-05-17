import EntretienPage from "./EntretienPage";
import { getUserFromToken } from "@/app/dashboard/auth";
import { redirect } from "next/navigation";

export default async function Programme() {
  const user = await getUserFromToken()
  if(!user) redirect('/login')
  const userPrivs = user.droit_utilisateur.split('/')
  return <EntretienPage userPrivs={userPrivs}/>
}
