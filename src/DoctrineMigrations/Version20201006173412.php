<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201006173412 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D973720C1');
        $this->addSql('ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D973720C1 FOREIGN KEY (selection_step) REFERENCES step (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE analysis_configuration DROP FOREIGN KEY FK_A247F75D973720C1');
        $this->addSql('ALTER TABLE analysis_configuration ADD CONSTRAINT FK_A247F75D973720C1 FOREIGN KEY (selection_step) REFERENCES step (id)');
    }
}
