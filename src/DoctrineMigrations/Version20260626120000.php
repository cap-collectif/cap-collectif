<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260626120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove obsolete Redirection.io site parameter';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("DELETE FROM site_parameter WHERE keyname = 'redirectionio.project.id'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("
            INSERT INTO site_parameter (id, keyname, value, created_at, updated_at, is_enabled, type, category, position)
            SELECT UUID(), 'redirectionio.project.id', '', NOW(), NOW(), 1, 0, 'pages.redirection', 2
            WHERE NOT EXISTS (
                SELECT 1 FROM site_parameter WHERE keyname = 'redirectionio.project.id'
            )
        ");
    }
}
