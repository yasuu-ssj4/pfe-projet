import { PrismaClient} from "@prisma/client";
import { NextResponse , NextRequest } from "next/server";
import { HistoriqueKilometrageHeure } from "@/app/interfaces";
const prisma = new PrismaClient();
import { ajouterHistoriqueKilometrageHeure } from "@/app/prisma";

export async function POST(request: NextRequest) {
  
    
    
     try {
        const donnees = await request.json();
        const { code_vehicule, kilo_parcouru_heure_fonctionnement } = donnees as HistoriqueKilometrageHeure;
        const date = new Date();
        console.log(donnees);
        console.log(date);
        const historique = await ajouterHistoriqueKilometrageHeure({code_vehicule,date, kilo_parcouru_heure_fonctionnement });
        return NextResponse.json({ historique, success: true }, { status: 200 });
        
        
     } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "erreur interne de serveur" }, { status: 500 });
     }
}