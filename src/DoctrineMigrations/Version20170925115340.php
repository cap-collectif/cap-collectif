<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170925115340 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('theme');
    }
}
