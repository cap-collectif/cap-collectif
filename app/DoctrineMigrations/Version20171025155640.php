<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Remove non null body field in proposal entity
 */
class Version20171025155640 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal CHANGE body body LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal CHANGE body body LONGTEXT NOT NULL COLLATE utf8_unicode_ci');
    }
}
