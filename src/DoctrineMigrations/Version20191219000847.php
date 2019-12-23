<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20191219000847 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('user_type');
    }
}
