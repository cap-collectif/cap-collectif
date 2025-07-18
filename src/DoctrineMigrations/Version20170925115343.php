<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170925115343 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('proposal');
    }
}
