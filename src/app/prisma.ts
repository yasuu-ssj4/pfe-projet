import { PrismaClient, utilisateur } from "@prisma/client";
import CryptoJS from "crypto-js";

import pkg, { constant, unary } from 'lodash';
import RootLayout from './layout';
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
const { forEach } = pkg;
const prisma = new PrismaClient(); 

export const SECRET_KEY = "NAFT_1981";

  
export async function ajouterVehicule(data: Vehicule) {
     await prisma.vehicule.create({ data });
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
     await prisma.structure.create({ data });
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
  
  export async function ajouterProgrammeEntretien(data: ProgrammeEntretien) {
     await prisma.progamme_entretien.create({ data });
  }
  
  export async function ajouterDemandeIntervention(data: DemandeIntervention) {
     await prisma.demande_intervention.create({ data });
  }
  
  export async function ajouterRapportIntervention(data: RapportIntervention) {
 await prisma.rapport_intervention.create({ data });
  }
  
  export async function ajouterTravauxInterne(data: TraveauxInterne) {
     await prisma.traveaux_interne.create({ data });
  }
  
  export async function ajouterTravauxExterne(data: TraveauxExterne) {
    await prisma.traveaux_externe.create({ data });
  }

const ramy : Utilisateur = {
   nom_utilisateur : "ramy",
   prenom_utilisateur : "ramy",
   username : "ramy",
   numero_telephone : "00000",
   mot_de_passe : "un mot de passe",
   email:"ramy",
   est_admin : true ,
   role : " admin",
   methode_authent :"bdd",
   droit_utilisateur : "admin",
   code_structure : "100"
}

const DI : DemandeIntervention = {
      etat_demande: 'En cours',
      date_heure_panne: new Date('2025-04-10T00:00:00.000Z'),
      structure_maintenance: 'cds',
      activite: 'Matériel roulant',
      nature_panne: 'mecanique',
      nature_travaux: 'corrective',
      degre_urgence: '3',
      date_application: new Date('2025-04-10T00:00:00.000Z'),
      district_id: '',
      centre_id: '100',
      date_demandeur: new Date('2025-04-10T00:00:00.000Z'),
      visa_demandeur: 'brah',
      id_demandeur: 1,
      code_vehicule : "A0156"
    
}
 
ajouterDemandeIntervention(DI)