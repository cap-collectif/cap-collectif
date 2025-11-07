<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251031075236 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add anonymized_at to fos_user + update already anonymized users';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user ADD anonymized_at DATETIME DEFAULT NULL');
        $this->addSql('UPDATE fos_user SET anonymized_at = updated_at WHERE username = "Utilisateur supprimé" OR username = "deleted-user"');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP anonymized_at');
    }
}
