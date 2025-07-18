<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170925115340 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('theme');
    }
}
