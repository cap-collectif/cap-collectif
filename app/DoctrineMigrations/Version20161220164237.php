<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Capco\AppBundle\IdToUuidMigration;

class Version20161220164237 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('source');
        $this->migrate('district');
        $this->migrate('reply');
        $this->migrate('project');
    }
}
