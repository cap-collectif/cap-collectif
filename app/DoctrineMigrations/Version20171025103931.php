<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171025103931 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal ADD is_draft TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal DROP is_draft');
    }
}
