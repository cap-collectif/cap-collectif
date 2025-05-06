<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160623163344 extends AbstractMigration
{
    private $selectionStepsProposals;

    public function preUp(Schema $schema): void
    {
        $this->selectionStepsProposals = $this->connection->fetchAllAssociative(
            'SELECT * FROM selectionstep_proposal'
        );
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE selection (id INT AUTO_INCREMENT NOT NULL, selection_step_id INT NOT NULL, proposal_id INT NOT NULL, status_id INT DEFAULT NULL, INDEX IDX_96A50CD7DB15B87D (selection_step_id), INDEX IDX_96A50CD7F4792058 (proposal_id), INDEX IDX_96A50CD76BF700BD (status_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE selection ADD CONSTRAINT FK_96A50CD7DB15B87D FOREIGN KEY (selection_step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE selection ADD CONSTRAINT FK_96A50CD7F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE selection ADD CONSTRAINT FK_96A50CD76BF700BD FOREIGN KEY (status_id) REFERENCES status (id) ON DELETE SET NULL'
        );
        $this->addSql('DROP TABLE selectionstep_proposal');
        $this->addSql('ALTER TABLE step ADD default_status_id VARCHAR(255) DEFAULT NULL');
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->selectionStepsProposals as $ssp) {
            $ssp['selection_step_id'] = $ssp['selectionstep_id'];
            unset($ssp['selectionstep_id']);
            $this->connection->insert('selection', $ssp);
        }
    }

    public function preDown(Schema $schema): void
    {
        $this->selectionStepsProposals = $this->connection->fetchAllAssociative(
            'SELECT * FROM selection'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE selectionstep_proposal (proposal_id INT NOT NULL, selectionstep_id INT NOT NULL, INDEX IDX_12E621064AF84DB2 (selectionstep_id), INDEX IDX_12E62106F4792058 (proposal_id), PRIMARY KEY(proposal_id, selectionstep_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE selectionstep_proposal ADD CONSTRAINT FK_12E621064AF84DB2 FOREIGN KEY (selectionstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE selectionstep_proposal ADD CONSTRAINT FK_12E62106F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP TABLE selection');
        $this->addSql('ALTER TABLE step DROP default_status_id');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->selectionStepsProposals as $ssp) {
            unset($ssp['id'], $ssp['status']);

            $ssp['selectionstep_id'] = $ssp['selection_step_id'];
            unset($ssp['selection_step_id']);
            $this->connection->insert('selectionstep_proposal', $ssp);
        }
    }
}
