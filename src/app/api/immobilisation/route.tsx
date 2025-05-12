import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { Immobilisation } from "@/app/interfaces"
import { ajouterImmobilisation } from "@/app/prisma"
const prisma = new PrismaClient()

// Get immobilization records for a specific user
export async function POST(request: NextRequest) {
 try {
   const body : Immobilisation = await request.json()
   const {code_vehicule , date_immobilisation ,cause_immobilisation ,lieu , action , echeance} = body
  console.log("body", body);
  
   await ajouterImmobilisation({code_vehicule , date_immobilisation : new Date(date_immobilisation),cause_immobilisation ,lieu , action , echeance})

   return NextResponse.json({
     message: "Immobilisation bien ajoutée",
     status: 200
   })
 } catch (error) {
   console.error("Error fetching immobilisation records:", error)
   return NextResponse.json({ error: "erreur lors de l'ajout de l'immobilisation" }, { status: 500 })
 }
}
