<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171010122516 extends IdToUuidMigration
{
    public function up(Schema $schema)
    {
      $this->migrate('media__media');
    }
}
