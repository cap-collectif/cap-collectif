<?php

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20161220164237 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('source');
        $this->migrate('district');
        $this->migrate('reply');
        $this->migrate('project');
    }
}
