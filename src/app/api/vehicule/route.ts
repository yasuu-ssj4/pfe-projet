import { NextRequest , NextResponse} from "next/server";
import { PrismaClient} from "@prisma/client";
import { Vehicule } from "@/app/interfaces";
import { ajouterVehicule } from "@/app/prisma";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }

        const body = await req.json();
console.log("BODY RECEIVED:", body);

const vehiculeData: Vehicule = body;
console.log("CASTED TO Vehicule:", vehiculeData); 
      


       const ajout = await ajouterVehicule(vehiculeData);
        console.log("Vehicle added successfully:", vehiculeData.code_vehicule);
        return NextResponse.json({ message: "Vehicle bien ajouté" }, { status: 200 });
      ;
    } catch (error: any) {
        console.error("Erreur pendant l'ajout ", error?.message, error?.stack, error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    
    
}