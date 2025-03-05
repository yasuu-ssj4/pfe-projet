BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[vehicule] (
    [id_vehicule] INT NOT NULL,
    [marque] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [n_immatriculation] NVARCHAR(1000) NOT NULL,
    [n_serie] NVARCHAR(1000) NOT NULL,
    [date_acquisition] DATETIME2 NOT NULL,
    [prix_acquisition] FLOAT(53) NOT NULL,
    [etat] NVARCHAR(1000) NOT NULL,
    [kilometrage] INT NOT NULL,
    [genre] NVARCHAR(1000) NOT NULL,
    [n_inventaire] NVARCHAR(1000) NOT NULL,
    [niveau_id] INT NOT NULL,
    CONSTRAINT [vehicule_pkey] PRIMARY KEY CLUSTERED ([id_vehicule])
);

-- CreateTable
CREATE TABLE [dbo].[Niveau] (
    [code_niveau] INT NOT NULL,
    [designation] NVARCHAR(1000) NOT NULL,
    [type_hierachie] NVARCHAR(1000) NOT NULL,
    [parent_id] INT,
    CONSTRAINT [Niveau_pkey] PRIMARY KEY CLUSTERED ([code_niveau])
);

-- CreateTable
CREATE TABLE [dbo].[service] (
    [id_service] INT NOT NULL,
    [type_service] NVARCHAR(1000) NOT NULL ,
    [id_niveau] INT NOT NULL,
    CONSTRAINT [service_pkey] PRIMARY KEY CLUSTERED ([id_service])
);

-- CreateTable
CREATE TABLE [dbo].[utilisateur] (
    [id_utilisateur] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [prenom] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [mot_de_passe] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [est_admin] BIT NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [branche_id] INT,
    [district_id] INT,
    [centre_id] INT,
    [service_id] INT,
    CONSTRAINT [utilisateur_pkey] PRIMARY KEY CLUSTERED ([id_utilisateur])
);

-- CreateTable
CREATE TABLE [dbo].[demande_interventionT] (
    [id_demande_intervention] INT NOT NULL IDENTITY(1,1),
    [date_application] DATETIME2 NOT NULL,
    [date_heure_panne] DATETIME2 NOT NULL,
    [structure_maintenance] NVARCHAR(1000) NOT NULL,
    [activite] NVARCHAR(1000) NOT NULL CONSTRAINT [demande_interventionT_activite_df] DEFAULT 'material roulant',
    [nature_panne] NVARCHAR(1000) NOT NULL,
    [nature_travaux] NVARCHAR(1000) NOT NULL,
    [degre_urgence] NVARCHAR(1000) NOT NULL,
    [id_vehicule] INT NOT NULL,
    [district_id] INT NOT NULL,
    [centre_id] INT NOT NULL,
    [branche_id] INT NOT NULL,
    CONSTRAINT [demande_interventionT_pkey] PRIMARY KEY CLUSTERED ([id_demande_intervention])
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
    [district_id] INT NOT NULL,
    [centre_id] INT NOT NULL,
    [branche_id] INT NOT NULL,
    [duree_travaux] NVARCHAR(1000) NOT NULL,
    [description_travaux] NVARCHAR(1000) NOT NULL,
    [essais] BIT NOT NULL,
    [reservation] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [rapport_intervention_pkey] PRIMARY KEY CLUSTERED ([id_rapport_intervention])
);

-- CreateTable
CREATE TABLE [dbo].[traveaux_interne] (
    [id_travaille] INT NOT NULL IDENTITY(1,1),
    [id_rapport] INT NOT NULL,
    [atelier] NVARCHAR(1000) NOT NULL,
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
ALTER TABLE [dbo].[vehicule] ADD CONSTRAINT [vehicule_niveau_id_fkey] FOREIGN KEY ([niveau_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Niveau] ADD CONSTRAINT [Niveau_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[service] ADD CONSTRAINT [service_id_niveau_fkey] FOREIGN KEY ([id_niveau]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[utilisateur] ADD CONSTRAINT [utilisateur_branche_id_fkey] FOREIGN KEY ([branche_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[utilisateur] ADD CONSTRAINT [utilisateur_district_id_fkey] FOREIGN KEY ([district_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[utilisateur] ADD CONSTRAINT [utilisateur_centre_id_fkey] FOREIGN KEY ([centre_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[utilisateur] ADD CONSTRAINT [utilisateur_service_id_fkey] FOREIGN KEY ([service_id]) REFERENCES [dbo].[service]([id_service]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[demande_interventionT] ADD CONSTRAINT [demande_interventionT_id_vehicule_fkey] FOREIGN KEY ([id_vehicule]) REFERENCES [dbo].[vehicule]([id_vehicule]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[demande_interventionT] ADD CONSTRAINT [demande_interventionT_district_id_fkey] FOREIGN KEY ([district_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[demande_interventionT] ADD CONSTRAINT [demande_interventionT_centre_id_fkey] FOREIGN KEY ([centre_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[demande_interventionT] ADD CONSTRAINT [demande_interventionT_branche_id_fkey] FOREIGN KEY ([branche_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rapport_intervention] ADD CONSTRAINT [rapport_intervention_id_demande_intervention_fkey] FOREIGN KEY ([id_demande_intervention]) REFERENCES [dbo].[demande_interventionT]([id_demande_intervention]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rapport_intervention] ADD CONSTRAINT [rapport_intervention_district_id_fkey] FOREIGN KEY ([district_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rapport_intervention] ADD CONSTRAINT [rapport_intervention_centre_id_fkey] FOREIGN KEY ([centre_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rapport_intervention] ADD CONSTRAINT [rapport_intervention_branche_id_fkey] FOREIGN KEY ([branche_id]) REFERENCES [dbo].[Niveau]([code_niveau]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[traveaux_interne] ADD CONSTRAINT [traveaux_interne_id_rapport_fkey] FOREIGN KEY ([id_rapport]) REFERENCES [dbo].[rapport_intervention]([id_rapport_intervention]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[traveaux_externe] ADD CONSTRAINT [traveaux_externe_id_rapport_fkey] FOREIGN KEY ([id_rapport]) REFERENCES [dbo].[rapport_intervention]([id_rapport_intervention]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[service] ADD CONSTRAINT [chk_type_service] CHECK (type_service IN ('transport', 'maintenance', 'section'));

ALTER TABLE [dbo].[Niveau] ADD CONSTRAINT [chk_type_hierachie] CHECK (type_hierachie IN ('dg','branche', 'unm','district', 'centre')); 


COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END; 
THROW

END CATCH
