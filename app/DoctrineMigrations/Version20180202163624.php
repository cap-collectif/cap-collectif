<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180202163624 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql(
            'ALTER TABLE opinion CHANGE moderation_token moderation_token VARCHAR(255) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE argument CHANGE moderation_token moderation_token VARCHAR(255) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_version CHANGE moderation_token moderation_token VARCHAR(255) NOT NULL'
        );
    }

    public function down(Schema $schema)
    {
        $this->addSql(
            'ALTER TABLE argument CHANGE moderation_token moderation_token VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE opinion CHANGE moderation_token moderation_token VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE opinion_version CHANGE moderation_token moderation_token VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci'
        );
    }
}
