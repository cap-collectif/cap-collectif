<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Capco\AppBundle\IdToUuidMigration;

class Version20161220164237 extends IdToUuidMigration
{
    public function __construct()
    {
        $this->table = 'source';
        $this->fks = [
          ['table' => 'reporting', 'key' => 'source_id', 'tmpKey' => 'source_uuid', 'nullable'=> true],
          ['table' => 'votes', 'key' => 'source_id', 'tmpKey' => 'source_uuid', 'nullable'=> true],
        ];
    }
}
