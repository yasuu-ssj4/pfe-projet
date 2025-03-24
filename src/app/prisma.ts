import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { error, log } from "console";
import pkg, { constant, unary } from 'lodash';
import { date, datetimeRegex, NEVER } from "zod";
import RootLayout from './layout';
const { forEach } = pkg;
const prisma = new PrismaClient(); 
interface utilisateur {
    
    nom : string;
    prenom : string;
    email : string;
    mot_de_passe : string;
    username : string;
    est_admin : boolean;
    role : string;
    branche_id? : number;
    district_id? : number;
    centre_id? : number;
    service_id? : number; 
}




interface Vehicule {
    id_vehicule :string;
    marque : string;
    type : string;
    n_immatriculation : string;
    n_serie : string;
    date_acquisition : Date;
    prix_acquisition : number;
    etat : string;
    kilometrage : number;
    genre : string;
    n_inventaire : string;
    niveau_id : number;
}





interface traveaux_interne {
    
    id_rapport : number;
    atelier : string;
    temps_alloue : number;
    PDR_consommee : string;
    cout_pdr : number;
    reference_bc_bm_btm : string;
}




interface traveaux_externe {
    id_travaille : number;
    id_rapport : number;
    design_prestataire : string;
    reference_contrat : string;
    reference_facture : string;
    cout_facture : number;
}
async function createNiveau() {
    await prisma.niveau.deleteMany()
  await prisma.niveau.create({
   data :{
     code_niveau: 100,
     designation: "Direction Générale",
     type_hierachie : "dg"
   },
   
})
     await prisma.niveau.createMany(
       {
            data: [
            {
                code_niveau: 400,
                designation: "Branche commercialisation",
                type_hierachie: "branche",
                parent_id: 100
            },
            {
                code_niveau: 500,
                designation: "Branche carburant",
                type_hierachie: "Branche",
                parent_id: 100
            },
            {
                code_niveau: 600,
                designation: "Branche GPL",
                type_hierachie: "branche",
                parent_id: 100
            }
            
        ]

       }
    )
}
export async function ajouterUtilisateur(Utilisateur : utilisateur){
await prisma.utilisateur.create(
{ data :{
 nom : Utilisateur.nom ,
 prenom : Utilisateur.prenom ,
 email : Utilisateur.email ,
 mot_de_passe : Utilisateur.mot_de_passe,
 username : Utilisateur.username ,
 est_admin : Utilisateur.est_admin ,

 role : Utilisateur.role , 
 branche_id : Utilisateur.branche_id ,
 district_id: Utilisateur.district_id,
 centre_id : Utilisateur.centre_id,
 service_id : Utilisateur.service_id
 },}



)
}
export async function ajouterVehicule(vehicule : Vehicule) {
    await prisma.vehicule.create({
   data : {
    id_vehicule : vehicule.id_vehicule , 
    marque : vehicule.marque,
    type : vehicule.type,
    n_immatriculation : vehicule.n_immatriculation,
    n_serie : vehicule.n_serie,
    date_acquisition : vehicule.date_acquisition,
    prix_acquisition : vehicule.prix_acquisition,
    etat : vehicule.etat,
    kilometrage : vehicule.kilometrage,
    genre: vehicule.genre ,
    n_inventaire : vehicule.n_inventaire,
    niveau_id : vehicule.niveau_id

   }
    })
}

export async function ajouterTavailleInterne(travailleInterne:traveaux_interne) {
    await prisma.traveaux_interne.create(
        {data :{
           id_rapport : travailleInterne.id_rapport,
           atelier : travailleInterne.atelier,
           temps_alloue :travailleInterne.temps_alloue,
           PDR_consommee : travailleInterne.PDR_consommee,
           cout_pdr: travailleInterne.cout_pdr,
           reference_bc_bm_btm : travailleInterne.reference_bc_bm_btm
        }
        }
    )
}

export async function ajouterTravailleExterne(travailleExterne:traveaux_externe) {
    await prisma.traveaux_externe.create({
        data : {
        id_rapport :travailleExterne.id_rapport,
        design_prestataire :  travailleExterne.design_prestataire,
        reference_contrat : travailleExterne.reference_contrat,
        reference_facture :travailleExterne.reference_facture,
        cout_facture : travailleExterne.cout_facture
        }
    }
        )
    }

async function aff() {
    const user = prisma.utilisateur.findMany()
    console.log(user)
}
aff()