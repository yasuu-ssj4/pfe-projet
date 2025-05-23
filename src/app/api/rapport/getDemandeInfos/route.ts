import { NextRequest , NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma =  new PrismaClient();

export async function POST(req: NextRequest){
    try {
        const contentType = req.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }
    
        const body = await req.json();
        
        const { id_demande_intervention } = body;
        console.log("ID Demande:", id_demande_intervention);
    
        const demandeentites = await prisma.demande_intervention.findUnique(
            {
                where : { 
                    id_demande_intervention: Number(id_demande_intervention),
                },
                select : {
                    structure_maintenance : true,
                    numero_demande : true,
                    date_heure_panne : true,
                    centre_id   : true,
                    district_id : true,
                }
            }
            
        )
        if (!demandeentites) {
            return NextResponse.json({ error: "pas de demande" }, { status: 404 });
            }
        
            
        type infos= {
            structure_maintenance : string ,
            numero_demande: string ,
            date_heure_panne: string ,
            district_id: string ,
            centre_id: string ,
        }
         const demandeInfos: infos = {
            structure_maintenance : demandeentites.structure_maintenance,
            numero_demande : demandeentites.numero_demande,
            date_heure_panne : demandeentites.date_heure_panne,
            district_id : demandeentites.district_id,
            centre_id : demandeentites.centre_id,
           
         };
            console.log("Infos Demande:", demandeInfos);
        return NextResponse.json(demandeInfos, { status: 200 });
    } catch (error) {
        console.error("Error fetching ", error);
        return NextResponse.json({ error: "erreur interne de serveur" }, { status: 500 });
    }
}