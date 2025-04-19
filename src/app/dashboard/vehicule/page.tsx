


import FormVehicule from "./formVehicules";
import AfficheVehicule from "./afficherVehicule";
import { getUserFromToken } from "../auth";
import { redirect } from "next/navigation";


export default async function Vehicule(){
    const user = await getUserFromToken();
    console.log("user", user);
  
    if (!user) redirect("/login");
  
    return (
        <div className="bg-[#dcdfe8] ">
                   {/*<Header/>*/}
                   <div className="flex flex-1 pt-[12vh] h-lvh ">
                   
                   <main className="w-full h-full flex-1  ">
                    <div className="flex justify-end">
                        <FormVehicule/>
                    </div>
                    <AfficheVehicule userId={user.id_utilisateur} />
                   </main>
                   </div>
        </div>
    );
}