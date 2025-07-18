<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170928201228 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('status');
    }
}
