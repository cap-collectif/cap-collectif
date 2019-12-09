<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150610192944 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes DROP FOREIGN KEY FK_4D64269135365590'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes DROP FOREIGN KEY FK_4D642691562C6E32'
        );
        $this->addSql('DROP INDEX idx_4d642691562c6e32 ON consultationstep_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_A2063B6F562C6E32 ON consultationstep_opiniontypes (consultationstep_id)'
        );
        $this->addSql('DROP INDEX idx_4d64269135365590 ON consultationstep_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_A2063B6F35365590 ON consultationstep_opiniontypes (opiniontype_id)'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D64269135365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D642691562C6E32 FOREIGN KEY (consultationstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE consultation_abstractstep DROP FOREIGN KEY FK_1064E18E62FF6CDF');
        $this->addSql('ALTER TABLE consultation_abstractstep DROP FOREIGN KEY FK_1064E18E73B21E9C');
        $this->addSql('DROP INDEX idx_1064e18e62ff6cdf ON consultation_abstractstep');
        $this->addSql(
            'CREATE INDEX IDX_B0564EB062FF6CDF ON consultation_abstractstep (consultation_id)'
        );
        $this->addSql('DROP INDEX uniq_1064e18e73b21e9c ON consultation_abstractstep');
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_B0564EB073B21E9C ON consultation_abstractstep (step_id)'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes DROP FOREIGN KEY FK_93E3748435365590'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes DROP FOREIGN KEY FK_93E37484E0D2FC3D'
        );
        $this->addSql('DROP INDEX idx_93e37484e0d2fc3d ON consultationtype_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_1E2A76B8E0D2FC3D ON consultationtype_opiniontypes (consultationtype_id)'
        );
        $this->addSql('DROP INDEX idx_93e3748435365590 ON consultationtype_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_1E2A76B835365590 ON consultationtype_opiniontypes (opiniontype_id)'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E3748435365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E37484E0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation_abstractstep DROP FOREIGN KEY FK_B0564EB062FF6CDF');
        $this->addSql('ALTER TABLE consultation_abstractstep DROP FOREIGN KEY FK_B0564EB073B21E9C');
        $this->addSql('DROP INDEX uniq_b0564eb073b21e9c ON consultation_abstractstep');
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_1064E18E73B21E9C ON consultation_abstractstep (step_id)'
        );
        $this->addSql('DROP INDEX idx_b0564eb062ff6cdf ON consultation_abstractstep');
        $this->addSql(
            'CREATE INDEX IDX_1064E18E62FF6CDF ON consultation_abstractstep (consultation_id)'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_B0564EB062FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_B0564EB073B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes DROP FOREIGN KEY FK_A2063B6F562C6E32'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes DROP FOREIGN KEY FK_A2063B6F35365590'
        );
        $this->addSql('DROP INDEX idx_a2063b6f562c6e32 ON consultationstep_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_4D642691562C6E32 ON consultationstep_opiniontypes (consultationstep_id)'
        );
        $this->addSql('DROP INDEX idx_a2063b6f35365590 ON consultationstep_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_4D64269135365590 ON consultationstep_opiniontypes (opiniontype_id)'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_A2063B6F562C6E32 FOREIGN KEY (consultationstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_A2063B6F35365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes DROP FOREIGN KEY FK_1E2A76B8E0D2FC3D'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes DROP FOREIGN KEY FK_1E2A76B835365590'
        );
        $this->addSql('DROP INDEX idx_1e2a76b8e0d2fc3d ON consultationtype_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_93E37484E0D2FC3D ON consultationtype_opiniontypes (consultationtype_id)'
        );
        $this->addSql('DROP INDEX idx_1e2a76b835365590 ON consultationtype_opiniontypes');
        $this->addSql(
            'CREATE INDEX IDX_93E3748435365590 ON consultationtype_opiniontypes (opiniontype_id)'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_1E2A76B8E0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_1E2A76B835365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
    }
}
