<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230324100003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add ON DELETE CASCADE to analysis_configuration';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75DDC63AE1D');
        $this->addSql('ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75DDC63AE1D FOREIGN KEY (selection_step_status) REFERENCES status (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75DDC63AE1D');
        $this->addSql('ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75DDC63AE1D FOREIGN KEY (selection_step_status) REFERENCES status (id)');
    }
}
