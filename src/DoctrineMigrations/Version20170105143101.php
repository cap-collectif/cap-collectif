<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170105143101 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
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
