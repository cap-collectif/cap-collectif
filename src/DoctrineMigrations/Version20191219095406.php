<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191219095406 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('site_parameter');
    }
}
