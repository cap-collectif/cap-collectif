<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200330130538 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE analysis_configuration (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', analysis_step CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', favourable_status CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', selection_step CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', effective_date DATETIME DEFAULT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, proposalForm_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', evaluationForm_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', UNIQUE INDEX UNIQ_A247F75DC86E21D5 (proposalForm_id), UNIQUE INDEX UNIQ_A247F75DA3077095 (evaluationForm_id), UNIQUE INDEX UNIQ_A247F75D720ABBD7 (analysis_step), UNIQUE INDEX UNIQ_A247F75D6219F4EB (favourable_status), UNIQUE INDEX UNIQ_A247F75D973720C1 (selection_step), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE analysis_unfavourable_statuses (analysis_configuration_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', status_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_125BA41FB160DB38 (analysis_configuration_id), INDEX IDX_125BA41F6BF700BD (status_id), PRIMARY KEY(analysis_configuration_id, status_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75DC86E21D5 FOREIGN KEY (proposalForm_id) REFERENCES proposal_form (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75DA3077095 FOREIGN KEY (evaluationForm_id) REFERENCES questionnaire (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D720ABBD7 FOREIGN KEY (analysis_step) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D6219F4EB FOREIGN KEY (favourable_status) REFERENCES status (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D973720C1 FOREIGN KEY (selection_step) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41FB160DB38 FOREIGN KEY (analysis_configuration_id) REFERENCES analysis_configuration (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41F6BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD analysis_configuration CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E834A247F75D FOREIGN KEY (analysis_configuration) REFERENCES analysis_configuration (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_72E9E834A247F75D ON proposal_form (analysis_configuration)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E834A247F75D');
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses DROP FOREIGN KEY FK_125BA41FB160DB38'
        );
        $this->addSql('DROP TABLE analysis_configuration');
        $this->addSql('DROP TABLE analysis_unfavourable_statuses');
        $this->addSql('DROP INDEX UNIQ_72E9E834A247F75D ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP analysis_configuration');
    }
}
