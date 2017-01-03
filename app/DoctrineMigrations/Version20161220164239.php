<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Capco\AppBundle\IdToUuidMigration;

class Version20161220164239 extends IdToUuidMigration
{
    public function __construct()
    {
        $this->table = 'reply';
        $this->fks = [
          ['table' => 'response', 'key' => 'reply_id', 'tmpKey' => 'reply_uuid', 'nullable'=> true],
        ];
    }
}
