<?php

declare(strict_types=1);

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200213114622 extends IdToUuidMigration
{
    public function getDescription(): string
    {
        return 'Migrates sections to UUID';
    }

    public function postUp(Schema $schema): void
    {
        $this->migrate('section');
    }
}
