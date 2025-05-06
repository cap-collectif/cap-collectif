<?php

declare(strict_types=1);

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20220421120000 extends IdToUuidMigration
{
    public function getDescription(): string
    {
        return 'responses to uuid';
    }

    public function postUp(Schema $schema): void
    {
        $this->migrate('response');
    }
}
