<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250926134807 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add prevent_proposal_edit and prevent_proposal_delete';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE step ADD prevent_proposal_edit TINYINT(1) DEFAULT \'0\', ADD prevent_proposal_delete TINYINT(1) DEFAULT \'0\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE step DROP prevent_proposal_edit, DROP prevent_proposal_delete');
    }
}
