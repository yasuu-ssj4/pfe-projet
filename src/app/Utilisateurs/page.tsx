import Compte from "./afficherAjouterUtilisateur";
import { redirect } from "next/navigation";
import { getUserFromToken } from '@/app/dashboard/auth';


export default async function Vehicule(){
    const user = await getUserFromToken();
    console.log("user", user);
  
    if (!user) redirect("/login");
  
    return (
        <div className="bg-[#dcdfe8] ">
                   {/*<Header/>*/}
                   <div className="flex flex-1 pt h-lvh ">
                   
                   <main className="w-full h-full flex-1  ">
                    
                    <Compte userId={user.id_utilisateur} userPrivs={user.droit_utilisateur.split('/')} />
                   </main>
                   </div>
        </div>
    );
}
