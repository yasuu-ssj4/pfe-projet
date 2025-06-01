import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sendVehicleIssueNotification } from "@/app/lib/mail";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { code_vehicule } = await req.json();

  try {
    interface ModelInfos {
      text_description: string;
      MARQUE: string;
      TYPE: string;
      GENRE: string;
      DESI_GENR: string;
      STATUT: string;
      month: number;
      dayofweek: number;
      vehicle_age: number;
      Kilometrage_Total: number;
    }

    interface vehiuleInfos {
      marque: string;
      type: string;
      genre: string;
      desi_genre: string;
      immatriculation: string;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const dayofweek = today.getDay() === 0 ? 1 : today.getDay() + 1;

    const vehiculeRaw = await prisma.vehicule.findFirst({
      where: { code_vehicule },
      select: {
        n_immatriculation: true,
        FK_vehicule_REF_type: {
          select: {
            designation: true,
            FK_type_REF_marque: {
              select: { designation: true }
            }
          }
        },
        FK_vehicule_REF_genre: {
          select: {
            code_genre: true,
            designation: true
          }
        },
      }
    });

    const vehiculeModelInfos: vehiuleInfos | null = vehiculeRaw
      ? {
          marque: vehiculeRaw.FK_vehicule_REF_type?.FK_type_REF_marque?.designation ?? "",
          type: vehiculeRaw.FK_vehicule_REF_type?.designation ?? "",
          genre: vehiculeRaw.FK_vehicule_REF_genre?.code_genre ?? "",
          desi_genre: vehiculeRaw.FK_vehicule_REF_genre?.designation ?? "",
          immatriculation: vehiculeRaw.n_immatriculation ?? ""
        }
      : null;

    const latestStatus = await prisma.historique_status.findFirst({
      where: { code_vehicule },
      orderBy: { date: "desc" },
      select: { code_status: true },
    });

    const totalKilo = await prisma.historique_kilometrage_heure.aggregate({
      where: { code_vehicule },
      _sum: { kilo_parcouru_heure_fonctionnement: true },
    });

    const immat = vehiculeModelInfos?.immatriculation ?? "";
    const immatYear = parseInt(immat.slice(-2)) || 0;
    const currentYear = today.getFullYear() % 100;
    const vehicle_age = Math.abs(currentYear - immatYear);
    const totalKilometrage = totalKilo._sum.kilo_parcouru_heure_fonctionnement ?? 0;

    const donnees: ModelInfos = {
      text_description: "moteur",
      MARQUE: vehiculeModelInfos?.marque ?? "",
      TYPE: vehiculeModelInfos?.type ?? "",
      GENRE: vehiculeModelInfos?.genre ?? "",
      DESI_GENR: vehiculeModelInfos?.desi_genre ?? "",
      STATUT: latestStatus?.code_status ?? "OPR",
      month,
      dayofweek,
      vehicle_age,
      Kilometrage_Total: totalKilometrage,
    };
    const code_structure_result = await prisma.affectation.findFirst({
      where: { code_vehicule },
      orderBy: { date: "desc" },
      select: { code_structure: true },
    });
    const code_structure_value = code_structure_result?.code_structure ?? undefined;
    console.log("FIFI  NORMALMMENT HAKA YBAN LOG AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",code_structure_value);
     const utilisateurAEnvoyer = await prisma.utilisateur.findMany({
      select: {
        email: true
      },
      where: {
        code_structure: code_structure_value
      }
    });
    console.log(utilisateurAEnvoyer);
      sendVehicleIssueNotification(
      "seddadislam05@gmail.com",
      code_vehicule,
      0.75,
      89600,
      "20GD",
      "ACERBI"
    )
  
    // ✅ Predict using your ML API
    const predictionResponse = await fetch("http://localhost:8000/predire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(donnees)
    });

    if (!predictionResponse.ok) {
      throw new Error("Erreur lors de la prédiction");
    }
 
   interface preditionType {
          text_description: string;
      MARQUE: string;
      TYPE: string;
      GENRE: string;
      DESI_GENR: string;
      STATUT: string;
      month: number;
      prediction : number ;
      probabilite_panne : number ;
      dayofweek: number;
      vehicle_age: number;
      Kilometrage_Total: number;
   }
    const predictionData: preditionType = await predictionResponse.json();
       sendVehicleIssueNotification(
      "seddadislam05@gmail.com",
      code_vehicule,
      predictionData.probabilite_panne,
      predictionData.Kilometrage_Total,
      predictionData.MARQUE,
      predictionData.TYPE
    )
    console.log(code_structure_value);
    
   await Promise.all(
  utilisateurAEnvoyer.map(user =>
    sendVehicleIssueNotification(
      user.email,
      code_vehicule,
      predictionData.probabilite_panne,
      predictionData.Kilometrage_Total,
      predictionData.MARQUE,
      predictionData.TYPE
    )
  )
);

    return NextResponse.json({
      prediction: predictionData,
    });

  } catch (error) {
    console.error("Erreur POST /predict:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
