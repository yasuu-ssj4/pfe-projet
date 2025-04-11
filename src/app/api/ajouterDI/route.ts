
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DemandeIntervention } from "@/app/interfaces";
import { ajouterDemandeIntervention } from "@/app/prisma";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
    try {
      const contentType = req.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return new Response(JSON.stringify({ error: "Invalid content type" }), { status: 400 });
      }
  
      const DiTransport = await req.json();
      console.log("DI Transport:", DiTransport);
      
      await ajouterDemandeIntervention(DiTransport);
      const latestDI = await prisma.demande_intervention.findFirst({
        orderBy: {
            id_demande_intervention: "desc",
            },
           
        select: {
          id_demande_intervention: true,
        },
      });
      
      return new Response(
        JSON.stringify({
          message: "Demande d'intervention créée avec succès",
          id_demande: latestDI?.id_demande_intervention, // only return the ID
        }),
        {
          status: 201,
        }
      );
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      return new Response(JSON.stringify({ error: "Erreur serveur pendant la création." }), { status: 500 });
    }
  }
  