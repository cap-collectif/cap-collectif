<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20191219000847 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('user_type');
    }
}
