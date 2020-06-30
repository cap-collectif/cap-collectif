<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200629134028 extends AbstractMigration
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

        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D6219F4EB');
        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D720ABBD7');
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D6219F4EB FOREIGN KEY (favourable_status) REFERENCES status (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D720ABBD7 FOREIGN KEY (analysis_step) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses DROP FOREIGN KEY FK_125BA41F6BF700BD'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses DROP FOREIGN KEY FK_125BA41FB160DB38'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41F6BF700BD FOREIGN KEY (status_id) REFERENCES status (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41FB160DB38 FOREIGN KEY (analysis_configuration_id) REFERENCES analysis_configuration (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D720ABBD7');
        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D6219F4EB');
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D720ABBD7 FOREIGN KEY (analysis_step) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D6219F4EB FOREIGN KEY (favourable_status) REFERENCES status (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses DROP FOREIGN KEY FK_125BA41FB160DB38'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses DROP FOREIGN KEY FK_125BA41F6BF700BD'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41FB160DB38 FOREIGN KEY (analysis_configuration_id) REFERENCES analysis_configuration (id)'
        );
        $this->addSql(
            'ALTER TABLE analysis_unfavourable_statuses ADD CONSTRAINT FK_125BA41F6BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
    }
}
