<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use CapCollectif\IdToUuid\IdToUuidMigration;

class Version20191105163837 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('page');
    }
}
