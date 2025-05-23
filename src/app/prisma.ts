import { PrismaClient, utilisateur } from "@prisma/client";
import CryptoJS from "crypto-js";

import {
    Vehicule,
    Marque,
    Type,
    Genre,
    Status,
    HistoriqueStatus,
    Structure,
    HistoriqueKilometrageHeure,
    Immobilisation,
    Affectation,
    Utilisateur,
    Gamme,
    Operation,
    ProgrammeEntretien,
    DemandeIntervention,
    RapportIntervention,
    TraveauxInterne,
    TraveauxExterne,
  } from "./interfaces";

const prisma = new PrismaClient(); 

export const SECRET_KEY = "NAFT_1981";

  
export async function ajouterVehicule(data: Vehicule) {
   await prisma.vehicule.create({data})
}

export async function ajouterMarque(data: Marque) {
     await prisma.marque.create({ data });
  }
  
  export async function ajouterType(data: Type) {
     await prisma.type.create({ data });
  }
  
  export async function ajouterGenre(data: Genre) {
     await prisma.genre.create({ data });
  }
  
  export async function ajouterStatus(data: Status) {
     await prisma.status.create({ data });
  }
  
  export async function ajouterHistoriqueStatus(data: HistoriqueStatus) {
     await prisma.historique_status.create({ data });
  }
  
  export async function ajouterStructure(data: Structure) {
     await prisma.structure.create({ data : {
      code_structure: data.code_structure,
      code_structure_hierachique: data.code_struture_hierachique,
      type_structure_hierachique: data.type_structure_hierachique,
      designation : data.designation,
     } });
  }
  
  export async function ajouterHistoriqueKilometrageHeure(data: HistoriqueKilometrageHeure) {
     await prisma.historique_kilometrage_heure.create({ data });
  }
  
  export async function ajouterImmobilisation(data: Immobilisation) {
 await prisma.immobilisation.create({ data });
  }
  
  export async function ajouterAffectation(data: Affectation) {
 await prisma.affectation.create({ data });
  }
  
  
export async function ajouterUtilisateur(user: Utilisateur) {
    const encryptedMdp = CryptoJS.AES.encrypt(user.mot_de_passe, SECRET_KEY).toString();

    await prisma.utilisateur.create({
        data: {
            nom_utilisateur: user.nom_utilisateur,
            prenom_utilisateur: user.prenom_utilisateur,
            username: user.username,
            email: user.email,
            numero_telephone: user.numero_telephone,
            mot_de_passe: encryptedMdp,
            code_structure: user.code_structure,
            methode_authent: user.methode_authent,
            est_admin: user.est_admin,
            droit_utilisateur: user.droit_utilisateur,
            role: user.role
        }
    });
}
  export async function ajouterGamme(data: Gamme) {
    await prisma.gamme.create({ data });
  }
  
  export async function ajouterOperation(data: Operation) {
 await prisma.operation.create({ data });
  }
  
//   export async function ajouterProgrammeEntretien(data: ProgrammeEntretien) {
//      await prisma.programme_entretien.create({ data });
//   }
  
  export async function ajouterDemandeIntervention(data: DemandeIntervention) {
     await prisma.demande_intervention.create({ 
         data
     });
  }
  

   export async function ajouterRapportIntervention(data: RapportIntervention) {
      await prisma.rapport_intervention.create({
        data: {
          id_rapport_intervention: data.id_rapport_intervention,
          id_demande_intervention: data.id_demande_intervention,
          structure_maintenance_en_charge_des_travaux: data.structure_maintenance_charge,
          date_application: new Date(data.date_application),
          date_debut_travaux: data.date_debut_travaux,
          date_fin_travaux: data.date_fin_travaux,
          date_panne: data.date_panne,
          date_prise_charge: data.date_prise_charge,
          duree_travaux: data.duree_travaux,
          district_id: data.district,
          centre_id: data.centre,
          numero_OR: data.numero_OR,
          description_essais: data.description_essais,
          essais: data.essais , 
          reservation: data.reservation,
          cout_total_traveaux_interne: data.cout_total_traveaux_interne,
          cout_total_traveaux_externe: data.cout_total_traveaux_externe,
          reference_documentée: data.reference_documentée,
          date_fin_permis: data.date_fin_permis,
          nom_prenom_utilisateur: data.nom_utilisateur, 
          date_utilisateur: data.date_utilisateur,
          nom_prenom_demandeur: data.nom_prenom_demandeur,
          date_demandeur: data.date_demandeur,
          nom_prenom_responsable: data.nom_prenom_responsable,
          date_responsable: data.date_responsable, 
        }
      });
    }
    
  
  export async function ajouterTravauxInterne(data: TraveauxInterne) {
     await prisma.traveaux_interne.create({ 
        data: {
          id_rapport: data.id_rapport,
          atelier_desc: data.atelier_desc,
          PDR_consommee: data.PDR_consommee,
          cout_pdr: Number.parseFloat(data.cout_pdr.toString()),
          reference_bc_bm_btm: data.reference_bc_bm_btm,
          temps_alloue: Number.parseFloat(data.temps_alloue.toString()),
          description: data.description,
        }
      });
  }
  
  export async function ajouterTravauxExterne(data: TraveauxExterne) {
    await prisma.traveaux_externe.create({ data : {
      id_rapport: data.id_rapport,
      design_prestataire: data.design_prestataire,
      reference_contrat: data.reference_contrat,
      reference_facture: data.reference_facture,
      cout_facture: Number.parseFloat(data.cout_facture.toString()),
      description: data.description,
    } });
  }

 const constater_vehicule = async (id_utilisateur: number) => {
    try {

    const res = await fetch("http://localhost:3000/api/rapport/listeRi", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_utilisateur }),
});

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression du rapport")
      }

     const data = await res.json()
     console.log(data);
     
     
    } catch (error) {
      console.error("Error in supprimerRapport:", error)
     
    }
  }
