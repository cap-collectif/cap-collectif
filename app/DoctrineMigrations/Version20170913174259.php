<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;


class Version20170913174259 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('status');
    }
}
