<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170606105810 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('step');
        $this->migrate('project_abstractstep');
    }
}
