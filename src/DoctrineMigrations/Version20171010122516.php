<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171010122516 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('media__media');
    }
}
