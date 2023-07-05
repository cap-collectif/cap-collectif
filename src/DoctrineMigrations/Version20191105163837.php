<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20191105163837 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('page');
    }
}
