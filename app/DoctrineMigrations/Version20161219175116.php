<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use CapCollectif\IdToUuid\IdToUuidMigration;

class Version20161219175116 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('fos_user');
    }
}
