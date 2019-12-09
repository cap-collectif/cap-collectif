<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171025103931 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal ADD is_draft TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE proposal CHANGE body body LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal DROP is_draft');
        $this->addSql(
            'ALTER TABLE proposal CHANGE body body LONGTEXT NOT NULL COLLATE utf8_unicode_ci'
        );
    }
}
