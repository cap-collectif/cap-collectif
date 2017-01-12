<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use CapCollectif\IdToUuid\IdToUuidMigration;

class Version20170105143101 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('argument');
    }
}
