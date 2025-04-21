import { PrismaClient} from "@prisma/client";
import { NextResponse , NextRequest } from "next/server";
import { Affectation } from "@/app/interfaces";
const prisma = new PrismaClient();
import { ajouterAffectation } from "@/app/prisma";

export async function POST(request: NextRequest) {
  
    
    
     try {
        const donnees = await request.json();
        const { code_vehicule, code_structure } = donnees as Affectation;
        const date = new Date();
        console.log(donnees);
        console.log(date);
        const affectation = await ajouterAffectation({code_vehicule, code_structure, date});
        return NextResponse.json({ affectation, success: true }, { status: 200 });
        
        
     } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "erreur interne de serveur" }, { status: 500 });
     }
}