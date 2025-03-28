import { PrismaClient } from "@prisma/client";
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
            droit_utilateur: user.droit_utilateur,
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
  
  const user : Utilisateur = {
  nom_utilisateur : "islam",
  prenom_utilisateur : "mohamed",
   username : "islam_unique",
   email : "abcd@naftal.dz",
   numero_telephone : "0555555555",
   mot_de_passe : "un mot de passe",
   code_structure : "300",
   methode_authent : "BDD",
   est_admin : true,
   droit_utilateur : "admin",
   role : "admin"

  }
   
 