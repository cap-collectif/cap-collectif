<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use CapCollectif\IdToUuid\IdToUuidMigration;

class Version20170105143101 extends IdToUuidMigration
{
    public function postUp(Schema $schema)
    {
        $this->migrate('argument');
        $this->migrate('opinion');
        $this->migrate('opinion_version');
        $this->migrate('opinion_type');
        $this->migrate('opinion_type_appendix_type');
        $this->migrate('opinion_modals');
        $this->migrate('appendix_type');
        $this->migrate('opinion_appendices');
        $this->migrate('consultation_step_type');
    }
}
