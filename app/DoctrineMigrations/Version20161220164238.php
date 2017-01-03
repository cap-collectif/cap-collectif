<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Capco\AppBundle\IdToUuidMigration;

class Version20161220164238 extends IdToUuidMigration
{
    public function __construct()
    {
        $this->table = 'district';
        $this->fks = [
          ['table' => 'proposal', 'key' => 'district_id', 'tmpKey' => 'district_uuid', 'nullable'=> true],
        ];
    }
}
