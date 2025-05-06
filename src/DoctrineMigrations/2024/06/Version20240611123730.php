<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240611123730 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add color.sub.menu.background to site_color';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("INSERT INTO site_color (keyname, is_enabled, created_at, updated_at, value, position, category) VALUES ('color.sub.menu.background', 1, NOW(), NOW(), '#ebebeb', 1, 'settings.appearance')");
    }

    public function down(Schema $schema): void
    {
    }
}
