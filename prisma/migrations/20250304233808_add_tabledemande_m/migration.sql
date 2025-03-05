/*
  Warnings:

  - You are about to drop the column `description_travaux` on the `rapport_intervention` table. All the data in the column will be lost.
  - Added the required column `date_fin_permis` to the `rapport_intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_essais` to the `rapport_intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_documentée` to the `rapport_intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_traveaux_externe` to the `rapport_intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_traveaux_interne` to the `rapport_intervention` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[rapport_intervention] ALTER COLUMN [reservation] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[rapport_intervention] DROP COLUMN [description_travaux];
ALTER TABLE [dbo].[rapport_intervention] ADD [date_fin_permis] DATETIME2 NOT NULL,
[description_essais] NVARCHAR(1000) NOT NULL,
[reference_documentée] NVARCHAR(1000) NOT NULL,
[total_traveaux_externe] INT NOT NULL,
[total_traveaux_interne] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[demande_interventionM] (
    [id] INT NOT NULL IDENTITY(1,1),
    [id_demande_intervention] INT NOT NULL,
    [id_vehicle] INT NOT NULL,
    [constat_panne] NVARCHAR(1000) NOT NULL,
    [diagnostique] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [niveaux_prio] INT NOT NULL,
    [necess_permis] BIT NOT NULL,
    [routinier] BIT NOT NULL,
    [routinier_ref] NVARCHAR(1000),
    [dangereux] BIT NOT NULL,
    [dangereux_ref] NVARCHAR(1000),
    CONSTRAINT [demande_interventionM_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[demande_interventionM] ADD CONSTRAINT [demande_interventionM_id_demande_intervention_fkey] FOREIGN KEY ([id_demande_intervention]) REFERENCES [dbo].[demande_interventionT]([id_demande_intervention]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
