import { PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { code_vehicule } = await req.json();

    if (!code_vehicule) {
      return NextResponse.json({ error: "Le code du véhicule est requis" }, { status: 400 });
    }

    const vehiculeRaw = await prisma.vehicule.findUnique({
      where: { code_vehicule },
      select: {
        code_vehicule: true,
        code_genre: true,
        FK_vehicule_REF_genre: {
          select: { designation: true }
        },
        code_type: true,
        FK_vehicule_REF_type: {
          select: { designation: true }
        },
        unite_predication: true,
        n_immatriculation: true,
        n_serie: true,
        date_acquisition: true,
        prix_acquisition: true,
        n_inventaire: true,
        date_debut_assurance: true,
        date_fin_assurance: true,
        date_debut_controle_technique: true,
        date_fin_controle_technique: true,
        date_debut_atmd: true,
        date_fin_atmd: true,
        date_debut_permis_circuler: true,
        date_fin_permis_circuler: true,
        date_debut_certificat: true,
        date_fin_certificat: true,
      }
    });

    if (!vehiculeRaw) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    const vehicule = {
      code_vehicule: vehiculeRaw.code_vehicule,
      code_genre: vehiculeRaw.code_genre,
      designation_genre: vehiculeRaw.FK_vehicule_REF_genre.designation,
      code_type: vehiculeRaw.code_type,
      designation_type: vehiculeRaw.FK_vehicule_REF_type.designation,
      unite_predication: vehiculeRaw.unite_predication,
      n_immatriculation: vehiculeRaw.n_immatriculation,
      n_serie: vehiculeRaw.n_serie,
      date_acquisition: vehiculeRaw.date_acquisition,
      prix_acquisition: vehiculeRaw.prix_acquisition,
      n_inventaire: vehiculeRaw.n_inventaire ?? undefined,
      date_debut_assurance: vehiculeRaw.date_debut_assurance,
      date_fin_assurance: vehiculeRaw.date_fin_assurance,
      date_debut_controle_technique: vehiculeRaw.date_debut_controle_technique,
      date_fin_controle_technique: vehiculeRaw.date_fin_controle_technique,
      date_debut_atmd: vehiculeRaw.date_debut_atmd,
      date_fin_atmd: vehiculeRaw.date_fin_atmd,
      date_debut_permis_circuler: vehiculeRaw.date_debut_permis_circuler,
      date_fin_permis_circuler: vehiculeRaw.date_fin_permis_circuler,
      date_debut_certificat: vehiculeRaw.date_debut_certificat,
      date_fin_certificat: vehiculeRaw.date_fin_certificat,
    };
      console.log("Véhicule trouvé:", vehicule);
      
    return NextResponse.json({ vehicule }, { status: 200 });

  } catch (error) {
    console.error("Erreur API POST /vehicule:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
