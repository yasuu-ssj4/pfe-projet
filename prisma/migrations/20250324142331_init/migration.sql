BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[vehicule] (
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [code_marque] INT NULL,
    [code_type] INT NULL,
    [code_genre] NVARCHAR(1000) NOT NULL,
    [code_status] NVARCHAR(1000) NULL,
    [unite_predication] NVARCHAR(1000) NOT NULL,
    [code_structure] NVARCHAR(1000) NOT NULL,
    [n_immatriculation] NVARCHAR(1000) NOT NULL,
    [n_serie] NVARCHAR(1000) NOT NULL,
    [date_acquisition] DATETIME2,
    [prix_acquisition] FLOAT(53),
    [n_inventaire] NVARCHAR(1000),
    [date_debut_assurance] DATETIME2,
    [date_fin_assurance] DATETIME2,
    [date_debut_controle_technique] DATETIME2,
    [date_fin_controle_technique] DATETIME2,
    [date_debut_atmd] DATETIME2,
    [date_fin_atmd] DATETIME2,
    [date_debut_permis_circuler] DATETIME2,
    [date_fin_permis_circuler] DATETIME2,
    [date_debut_certificat] DATETIME2,
    [date_fin_certificat] DATETIME2,
    CONSTRAINT [vehicule_pkey] PRIMARY KEY CLUSTERED ([code_vehicule])
);

-- CreateTable
CREATE TABLE [dbo].[marque] (
    [id_marque] INT NOT NULL IDENTITY(1,1),
    [designation] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [marque_pkey] PRIMARY KEY CLUSTERED ([id_marque])
);

-- CreateTable
CREATE TABLE [dbo].[type] (
    [id_type] INT NOT NULL IDENTITY(1,1),
    [designation] NVARCHAR(1000) NOT NULL,
    [id_marque] INT NOT NULL,
    CONSTRAINT [type_pkey] PRIMARY KEY CLUSTERED ([id_type])
);

-- CreateTable
CREATE TABLE [dbo].[genre] (
    [code_genre] NVARCHAR(1000) NOT NULL,
    [designation] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [genre_pkey] PRIMARY KEY CLUSTERED ([code_genre])
);

-- CreateTable
CREATE TABLE [dbo].[status] (
    [code_status] NVARCHAR(1000) NOT NULL,
    [designation] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [status_pkey] PRIMARY KEY CLUSTERED ([code_status])
);

-- CreateTable
CREATE TABLE [dbo].[historique_status] (
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [code_status] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    CONSTRAINT [historique_status_pkey] PRIMARY KEY CLUSTERED ([code_vehicule],[code_status],[date])
);

-- CreateTable
CREATE TABLE [dbo].[structure] (
    [code_structure] NVARCHAR(1000) NOT NULL,
    [structure_parent] NVARCHAR(1000),
    [designation] NVARCHAR(1000) NOT NULL,
    [type_hierarchy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [structure_pkey] PRIMARY KEY CLUSTERED ([code_structure])
);

-- CreateTable
CREATE TABLE [dbo].[historique_kilometrage_heure] (
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [kilo_parcouru_heure_fonctionnement] FLOAT(53) NOT NULL,
    CONSTRAINT [historique_kilometrage_heure_pkey] PRIMARY KEY CLUSTERED ([code_vehicule],[date])
);

-- CreateTable
CREATE TABLE [dbo].[immobilisation] (
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [date_immobilisation] DATETIME2 NOT NULL,
    [cause_immobilisation] NVARCHAR(1000) NOT NULL,
    [lieu] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [echeance] DATETIME2 NOT NULL,
    CONSTRAINT [immobilisation_pkey] PRIMARY KEY CLUSTERED ([code_vehicule],[date_immobilisation])
);

-- CreateTable
CREATE TABLE [dbo].[affectation] (
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [code_structure] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    CONSTRAINT [affectation_pkey] PRIMARY KEY CLUSTERED ([code_vehicule],[code_structure],[date])
);

-- CreateTable
CREATE TABLE [dbo].[utilisateur] (
    [id_utilisateur] INT NOT NULL IDENTITY(1,1),
    [nom_utilisateur] NVARCHAR(1000) NOT NULL,
    [prenom_utilisateur] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [numero_telephone] NVARCHAR(1000) NOT NULL,
    [mot_de_passe] NVARCHAR(1000) NOT NULL,
    [code_structure] NVARCHAR(1000) NOT NULL,
    [methode_authent] NVARCHAR(1000) NOT NULL,
    [est_admin] BIT NOT NULL,
    [droit_utilateur] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [utilisateur_pkey] PRIMARY KEY CLUSTERED ([id_utilisateur])
);

-- CreateTable
CREATE TABLE [dbo].[gamme] (
    [code_gamme] NVARCHAR(1000) NOT NULL,
    [designation] NVARCHAR(1000) NOT NULL,
    [unite_mesure] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [gamme_pkey] PRIMARY KEY CLUSTERED ([code_gamme])
);

-- CreateTable
CREATE TABLE [dbo].[operation] (
    [code_operation] NVARCHAR(1000) NOT NULL,
    [designation] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [operation_pkey] PRIMARY KEY CLUSTERED ([code_operation])
);

-- CreateTable
CREATE TABLE [dbo].[progamme_entretien] (
    [code_gamme] NVARCHAR(1000) NOT NULL,
    [code_operation] NVARCHAR(1000) NOT NULL,
    [code_type] INT NOT NULL,
    CONSTRAINT [progamme_entretien_pkey] PRIMARY KEY CLUSTERED ([code_type],[code_gamme],[code_operation])
);

-- CreateTable
CREATE TABLE [dbo].[demande_intervention] (
    [id_demande_intervention] INT NOT NULL IDENTITY(1,1),
    [date_application] DATETIME2 NOT NULL,
    [date_heure_panne] DATETIME2 NOT NULL,
    [structure_maintenance] NVARCHAR(1000) NOT NULL,
    [activite] NVARCHAR(1000) NOT NULL CONSTRAINT [demande_intervention_activite_df] DEFAULT 'material roulant',
    [nature_panne] NVARCHAR(1000) NOT NULL,
    [nature_travaux] NVARCHAR(1000) NOT NULL,
    [degre_urgence] NVARCHAR(1000) NOT NULL,
    [code_vehicule] NVARCHAR(1000) NOT NULL,
    [branche_id] NVARCHAR(1000) NOT NULL,
    [district_id] NVARCHAR(1000) NOT NULL,
    [centre_id] NVARCHAR(1000) NOT NULL,
    [constat_panne] NVARCHAR(1000) NOT NULL,
    [diagnostique] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [niveaux_prio] INT NOT NULL,
    [necess_permis] BIT NOT NULL,
    [routinier] BIT NOT NULL,
    [routinier_ref] NVARCHAR(1000),
    [dangereux] BIT NOT NULL,
    [dangereux_ref] NVARCHAR(1000),
    [id_demandeur] INT NOT NULL,
    [date_demandeur] DATETIME2 NOT NULL,
    [visa_demandeur] NVARCHAR(1000) NOT NULL,
    [id_intervevant] INT NOT NULL,
    [date_intervevant] DATETIME2 NOT NULL,
    [visa_intervevant] NVARCHAR(1000) NOT NULL,
    [nom_prenom_responsable] NVARCHAR(1000) NOT NULL,
    [date_responsable] DATETIME2 NOT NULL,
    [visa_responsable] NVARCHAR(1000) NOT NULL,
    [fonction_responsable] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [demande_intervention_pkey] PRIMARY KEY CLUSTERED ([id_demande_intervention])
);

-- CreateTable
CREATE TABLE [dbo].[rapport_intervention] (
    [id_rapport_intervention] INT NOT NULL IDENTITY(1,1),
    [id_demande_intervention] INT NOT NULL,
    [date_application] DATETIME2 NOT NULL,
    [date_debut_travaux] DATETIME2 NOT NULL,
    [date_fin_travaux] DATETIME2 NOT NULL,
    [date_panne] DATETIME2 NOT NULL,
    [date_prise_charge] DATETIME2 NOT NULL,
    [duree_travaux] NVARCHAR(1000) NOT NULL,
    [description_essais] NVARCHAR(1000) NOT NULL,
    [essais] BIT NOT NULL,
    [reservation] NVARCHAR(1000),
    [cout_total_traveaux_interne] INT NOT NULL,
    [cout_total_traveaux_externe] INT NOT NULL,
    [reference_documentée] NVARCHAR(1000) NOT NULL,
    [date_fin_permis] DATETIME2 NOT NULL,
    [id_utilisateur] INT NOT NULL,
    [date_utilisateur] DATETIME2 NOT NULL,
    [visa_utilisateur] NVARCHAR(1000) NOT NULL,
    [nom_prenom_demandeur] NVARCHAR(1000) NOT NULL,
    [date_demandeur] DATETIME2 NOT NULL,
    [visa_demandeur] NVARCHAR(1000) NOT NULL,
    [nom_prenom_responsable] NVARCHAR(1000) NOT NULL,
    [date_responsable] DATETIME2 NOT NULL,
    [visa_responsable] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [rapport_intervention_pkey] PRIMARY KEY CLUSTERED ([id_rapport_intervention]),
    CONSTRAINT [rapport_intervention_id_demande_intervention_key] UNIQUE NONCLUSTERED ([id_demande_intervention])
);

-- CreateTable
CREATE TABLE [dbo].[traveaux_interne] (
    [id_travaille] INT NOT NULL IDENTITY(1,1),
    [id_rapport] INT NOT NULL,
    [atelier_desc] NVARCHAR(1000) NOT NULL,
    [temps_alloue] INT NOT NULL,
    [PDR_consommee] NVARCHAR(1000) NOT NULL,
    [cout_pdr] INT NOT NULL,
    [reference_bc_bm_btm] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [traveaux_interne_pkey] PRIMARY KEY CLUSTERED ([id_travaille])
);

-- CreateTable
CREATE TABLE [dbo].[traveaux_externe] (
    [id_travaille] INT NOT NULL IDENTITY(1,1),
    [id_rapport] INT NOT NULL,
    [design_prestataire] NVARCHAR(1000) NOT NULL,
    [reference_contrat] NVARCHAR(1000) NOT NULL,
    [reference_facture] NVARCHAR(1000) NOT NULL,
    [cout_facture] INT NOT NULL,
    CONSTRAINT [traveaux_externe_pkey] PRIMARY KEY CLUSTERED ([id_travaille])
);

-- AddForeignKey
ALTER TABLE [dbo].[vehicule] ADD CONSTRAINT [vehicule_code_type_fkey] FOREIGN KEY ([code_type]) REFERENCES [dbo].[type]([id_type]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[vehicule] ADD CONSTRAINT [vehicule_code_genre_fkey] FOREIGN KEY ([code_genre]) REFERENCES [dbo].[genre]([code_genre]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[vehicule] ADD CONSTRAINT [vehicule_code_structure_fkey] FOREIGN KEY ([code_structure]) REFERENCES [dbo].[structure]([code_structure]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[type] ADD CONSTRAINT [type_id_marque_fkey] FOREIGN KEY ([id_marque]) REFERENCES [dbo].[marque]([id_marque]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[historique_status] ADD CONSTRAINT [historique_status_code_vehicule_fkey] FOREIGN KEY ([code_vehicule]) REFERENCES [dbo].[vehicule]([code_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[historique_status] ADD CONSTRAINT [historique_status_code_status_fkey] FOREIGN KEY ([code_status]) REFERENCES [dbo].[status]([code_status]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[structure] ADD CONSTRAINT [structure_structure_parent_fkey] FOREIGN KEY ([structure_parent]) REFERENCES [dbo].[structure]([code_structure]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[historique_kilometrage_heure] ADD CONSTRAINT [historique_kilometrage_heure_code_vehicule_fkey] FOREIGN KEY ([code_vehicule]) REFERENCES [dbo].[vehicule]([code_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[immobilisation] ADD CONSTRAINT [immobilisation_code_vehicule_fkey] FOREIGN KEY ([code_vehicule]) REFERENCES [dbo].[vehicule]([code_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[affectation] ADD CONSTRAINT [affectation_code_vehicule_fkey] FOREIGN KEY ([code_vehicule]) REFERENCES [dbo].[vehicule]([code_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[affectation] ADD CONSTRAINT [affectation_code_structure_fkey] FOREIGN KEY ([code_structure]) REFERENCES [dbo].[structure]([code_structure]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[utilisateur] ADD CONSTRAINT [utilisateur_code_structure_fkey] FOREIGN KEY ([code_structure]) REFERENCES [dbo].[structure]([code_structure]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[progamme_entretien] ADD CONSTRAINT [progamme_entretien_code_type_fkey] FOREIGN KEY ([code_type]) REFERENCES [dbo].[type]([id_type]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[progamme_entretien] ADD CONSTRAINT [progamme_entretien_code_gamme_fkey] FOREIGN KEY ([code_gamme]) REFERENCES [dbo].[gamme]([code_gamme]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[progamme_entretien] ADD CONSTRAINT [progamme_entretien_code_operation_fkey] FOREIGN KEY ([code_operation]) REFERENCES [dbo].[operation]([code_operation]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[demande_intervention] ADD CONSTRAINT [demande_intervention_code_vehicule_fkey] FOREIGN KEY ([code_vehicule]) REFERENCES [dbo].[vehicule]([code_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[rapport_intervention] ADD CONSTRAINT [rapport_intervention_id_demande_intervention_fkey] FOREIGN KEY ([id_demande_intervention]) REFERENCES [dbo].[demande_intervention]([id_demande_intervention]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[traveaux_interne] ADD CONSTRAINT [traveaux_interne_id_rapport_fkey] FOREIGN KEY ([id_rapport]) REFERENCES [dbo].[rapport_intervention]([id_rapport_intervention]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[traveaux_externe] ADD CONSTRAINT [traveaux_externe_id_rapport_fkey] FOREIGN KEY ([id_rapport]) REFERENCES [dbo].[rapport_intervention]([id_rapport_intervention]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
