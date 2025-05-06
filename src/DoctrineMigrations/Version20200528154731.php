<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200528154731 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add selection step status on analysis configuration.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE analysis_configuration ADD selection_step_status CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75DDC63AE1D FOREIGN KEY (selection_step_status) REFERENCES status (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_A247F75DDC63AE1D ON analysis_configuration (selection_step_status)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75DDC63AE1D');
        $this->addSql('DROP INDEX UNIQ_A247F75DDC63AE1D ON analysis_configuration');
        $this->addSql('ALTER TABLE analysis_configuration DROP selection_step_status');
    }
}
