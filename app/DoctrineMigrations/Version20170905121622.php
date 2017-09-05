<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170905121622 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT NOT NULL');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT DEFAULT NULL');
    }
}
