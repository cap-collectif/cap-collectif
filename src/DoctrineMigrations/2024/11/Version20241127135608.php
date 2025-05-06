<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241127135608 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'update media__media provider_name to AppBundle';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE media__media set provider_name = REPLACE(provider_name, 'MediaBundle', 'AppBundle') WHERE provider_name LIKE '%MediaBundle%'");
    }

    public function down(Schema $schema): void
    {
    }
}
