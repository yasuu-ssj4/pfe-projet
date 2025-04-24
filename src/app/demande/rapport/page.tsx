
import FormRapport from "./rapport"
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/app/dashboard/auth";

export default async function Rapport(){
    const user = await getUserFromToken();
    console.log("user", user);
  
    if (!user) redirect("/login");
  
    return (
        <div className="bg-[#dcdfe8] ">
                   {/*<Header/>*/}
                   <div className="flex flex-1 pt-[12vh] h-lvh ">
                   
                   <main className="w-full h-full flex-1  ">
                    <div className="flex justify-end">
                        <FormRapport/>
                    </div>
                   </main>
                   </div>
        </div>
    );
}