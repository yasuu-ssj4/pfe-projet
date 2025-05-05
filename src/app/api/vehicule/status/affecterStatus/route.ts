import { PrismaClient} from "@prisma/client";
import { NextResponse , NextRequest } from "next/server";
import { HistoriqueStatus } from "@/app/interfaces";
const prisma = new PrismaClient();
import { ajouterHistoriqueStatus } from "@/app/prisma";
import { Status } from '../../../../interfaces';

export async function POST(request: NextRequest) {
  
    
    
     try {
        const donnees = await request.json();
        const { code_vehicule, code_status } = donnees ;
        const date = new Date();
        console.log(donnees);
        console.log(date);
        const affectationStatus = await ajouterHistoriqueStatus({code_vehicule, code_status, date});
        return NextResponse.json({ affectationStatus, success: true }, { status: 200 });
        
        
     } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "erreur interne de serveur" }, { status: 500 });
     }
}
export async function GET () {
  try {
    
    const historiqueStatus = await prisma.status.findMany({
    
    });
    return NextResponse.json(historiqueStatus, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "erreur interne de serveur" }, { status: 500 });
  }
}