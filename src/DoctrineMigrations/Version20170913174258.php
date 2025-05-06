<?php

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170913174258 extends IdToUuidMigration
{
    public function postUp(Schema $schema): void
    {
        $this->migrate('category');
        $this->migrate('proposal_category');
    }
}
