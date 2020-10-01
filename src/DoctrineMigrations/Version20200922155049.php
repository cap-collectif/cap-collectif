<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200922155049 extends AbstractMigration
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

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E834A247F75D');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E834A247F75D FOREIGN KEY (analysis_configuration) REFERENCES analysis_configuration (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE logic_jump DROP FOREIGN KEY FK_DD5F9E8D816C6140');
        $this->addSql(
            'ALTER TABLE logic_jump ADD CONSTRAINT FK_DD5F9E8D816C6140 FOREIGN KEY (destination_id) REFERENCES question (id) ON DELETE SET NULL'
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
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E834A247F75D FOREIGN KEY (analysis_configuration) REFERENCES analysis_configuration (id)'
        );
        $this->addSql('ALTER TABLE logic_jump DROP FOREIGN KEY FK_DD5F9E8D816C6140');
        $this->addSql(
            'ALTER TABLE logic_jump ADD CONSTRAINT FK_DD5F9E8D816C6140 FOREIGN KEY (destination_id) REFERENCES question (id)'
        );
    }
}
