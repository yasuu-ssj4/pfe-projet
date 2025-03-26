export interface Vehicule {
    code_vehicule: string;
    code_marque: number;
    code_type: number;
    code_genre: string;
    code_status: string;
    unite_predication: string;
    code_structure: string;
    n_immatriculation: string;
    n_serie: string;
    date_acquisition?: Date;
    prix_acquisition?: number;
    n_inventaire?: string;
    date_debut_assurance?: Date;
    date_fin_assurance?: Date;
    date_debut_controle_technique?: Date;
    date_fin_controle_technique?: Date;
    date_debut_atmd?: Date;
    date_fin_atmd?: Date;
    date_debut_permis_circuler?: Date;
    date_fin_permis_circuler?: Date;
    date_debut_certificat?: Date;
    date_fin_certificat?: Date;
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
    structure_parent?: string;
    designation: string;
    type_hierarchy: string;
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
    echeance: Date;
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
    droit_utilateur: string;
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
    date_application: Date;
    date_heure_panne: Date;
    structure_maintenance: string;
    activite: string;
    nature_panne: string;
    nature_travaux: string;
    degre_urgence: string;
    code_vehicule: string;
    branche_id: string;
    district_id: string;
    centre_id: string;
    constat_panne: string;
    diagnostique: string;
    description: string;
    niveaux_prio: number;
    necess_permis: boolean;
    routinier: boolean;
    routinier_ref?: string;
    dangereux: boolean;
    dangereux_ref?: string;
    id_demandeur: number;
    date_demandeur: Date;
    visa_demandeur: string;
    id_intervevant: number;
    date_intervevant: Date;
    visa_intervevant: string;
    nom_prenom_responsable: string;
    date_responsable: Date;
    visa_responsable: string;
    fonction_responsable: string;
  }
  
  export interface RapportIntervention {
    
    id_demande_intervention: number;
    date_application: Date;
    date_debut_travaux: Date;
    date_fin_travaux: Date;
    date_panne: Date;
    date_prise_charge: Date;
    duree_travaux: string;
    description_essais: string;
    essais: boolean;
    reservation?: string;
    cout_total_traveaux_interne: number;
    cout_total_traveaux_externe: number;
    reference_documentée: string;
    date_fin_permis: Date;
    id_utilisateur: number;
    date_utilisateur: Date;
    visa_utilisateur: string;
    nom_prenom_demandeur: string;
    date_demandeur: Date;
    visa_demandeur: string;
    nom_prenom_responsable: string;
    date_responsable: Date;
    visa_responsable: string;
  }
  
  export interface TraveauxInterne {
    
    id_rapport: number;
    atelier_desc: string;
    temps_alloue: number;
    PDR_consommee: string;
    cout_pdr: number;
    reference_bc_bm_btm: string;
  }
  
  export interface TraveauxExterne {
    id_rapport: number;
    design_prestataire: string;
    reference_contrat: string;
    reference_facture: string;
    cout_facture: number;
  }