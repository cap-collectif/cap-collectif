<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20161219175116 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('fos_user');
    }
}
