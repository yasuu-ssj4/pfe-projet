import { ajouterUtilisateur } from "./prisma";

export interface Vehicule {

  code_vehicule: string;
  code_genre: string;
  code_type: number;
  unite_predication: string;
  n_immatriculation: string;
  n_serie: string;
  date_acquisition?: Date |null ;
  prix_acquisition?: number | null ;
  n_inventaire?: string;
    date_debut_assurance?: Date | null;
    date_fin_assurance?: Date | null;
    date_debut_controle_technique?: Date | null;
    date_fin_controle_technique?: Date | null;
    date_debut_atmd?: Date | null;
    date_fin_atmd?: Date | null;
    date_debut_permis_circuler?: Date | null;
    date_fin_permis_circuler?: Date | null;
    date_debut_certificat?: Date | null;
    date_fin_certificat?: Date | null;
  }
  
  export interface Marque {
    designation: string;
  }
  
  export interface Type {
    designation: string;
    id_marque: number;
  }
  
 export interface Genre {
    code_genre: string;
    designation: string;
  }
  
  export interface Status {
    code_status: string;
    designation: string;
  }
  
 export  interface HistoriqueStatus {
    code_vehicule: string;
    code_status: string;
    date: Date;
  }
  
  export interface Structure {
    code_structure: string;
    code_struture_hierachique?: string;
    designation: string;
    type_structure_hierachique: string;
  }
  
  export interface HistoriqueKilometrageHeure {
    code_vehicule: string;
    date: Date;
    kilo_parcouru_heure_fonctionnement: number;
  }
  
 export  interface Immobilisation {
    code_vehicule: string;
    date_immobilisation: Date;
    cause_immobilisation: string;
    lieu: string;
    action: string;
    echeance?: Date;
  }
  
  export interface Affectation {
    code_vehicule: string;
    code_structure: string;
    date: Date;
  }
  
  export interface Utilisateur {
    nom_utilisateur: string;
    prenom_utilisateur: string;
    username: string;
    email: string;
    numero_telephone: string;
    mot_de_passe: string;
    code_structure: string;
    methode_authent: string;
    est_admin: boolean;
    droit_utilisateur: string;
    role: string;
  }
  export interface Utilisateurid {
    id_utilisateur: number | null;
    nom_utilisateur: string;
    prenom_utilisateur: string;
    username: string;
    email: string;
    numero_telephone : string;
    mot_de_passe: string;
    code_structure: string;
    methode_authent: string;
    est_admin: boolean;
    droit_utilisateur: string;
    role: string;
  }
  export interface Gamme {
    code_gamme: string;
    designation: string;
    unite_mesure: string;
  }
  
  export interface Operation {
    code_operation: string;
    designation: string;
  }
  
  export interface ProgrammeEntretien {
    code_gamme: string;
    code_operation: string;
    code_type: number;
  }
  export interface DemandeIntervention {
    
    numero_demande: string;
    etat_demande: string;
    date_application: Date;
    date_heure_panne: string;
    structure_maintenance: string;
    activite: string;
    nature_panne: string;
    nature_travaux: string;
    degre_urgence: string;
    code_vehicule: string;
    district_id: string;
    centre_id: string;
    constat_panne?: string;
    diagnostique?: string;
    description?: string;
    niveaux_prio?: number;
    necess_permis?: boolean;
    routinier?: boolean;
    routinier_ref?: string;
    dangereux?: boolean;
    dangereux_ref?: string;
    nom_prenom_demandeur: string;
    fonction_demandeur?: string;
    date_demandeur: Date;
    nom_prenom_intervevant?: string;
    fonction_intervevant?: string;
    date_intervevant?: Date;
    nom_prenom_responsable?: string;
    date_responsable?: string;
    fonction_responsable?: string;
    date_responsable_unm?: string;
    fonction_responsable_unm?: string;
    nom_prenom_responsable_unm?: string;
    date_hse?: string;
    fonction_hse?: string;
    nom_prenom_hse?: string;
  }
  
  export interface RapportIntervention {

    id_demande_intervention: number;
    id_rapport_intervention: string;
    structure_maintenance_charge: string;
    date_application: Date;
    date_debut_travaux: string ;
    date_fin_travaux: string ;
    date_panne: string | Date;
    date_prise_charge: string ;
    duree_travaux: string;
    district: string;
    centre: string;
    numero_OR: string;
    description_essais: string;
    essais: string;
    reservation: string | null;
    cout_total_traveaux_interne: number;
    cout_total_traveaux_externe: number;
    reference_documentée: string;
    date_fin_permis: string ;
    nom_utilisateur: string;
    date_utilisateur: Date;
    nom_prenom_demandeur: string;
    date_demandeur: string ;
    nom_prenom_responsable: string;
    date_responsable: string ;
  }
  
export interface TraveauxInterne {
    
    id_rapport: string;
    atelier_desc: string;
    temps_alloue: number;
    PDR_consommee: string;
    cout_pdr: number;
    reference_bc_bm_btm: string;
    description: string | null;
  }
  
  export interface TraveauxExterne {
    id_rapport: string;
    design_prestataire: string;
    reference_contrat: string;
    reference_facture: string;
    cout_facture: number;
    description : string | null;
  }
 