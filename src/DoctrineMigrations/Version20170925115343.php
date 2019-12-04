<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170925115343 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
      $this->migrate('proposal');
    }
}
