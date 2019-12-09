<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171018112231 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE notifications_configuration ADD on_comment_create TINYINT(1) DEFAULT \'0\', ADD on_comment_update TINYINT(1) DEFAULT \'0\', ADD on_comment_delete TINYINT(1) DEFAULT \'0\', CHANGE on_create on_create TINYINT(1) DEFAULT \'0\', CHANGE on_update on_update TINYINT(1) DEFAULT \'0\', CHANGE on_delete on_delete TINYINT(1) DEFAULT \'0\''
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE notifications_configuration DROP on_comment_create, DROP on_comment_update, DROP on_comment_delete, CHANGE on_create on_create TINYINT(1) DEFAULT NULL, CHANGE on_update on_update TINYINT(1) DEFAULT NULL, CHANGE on_delete on_delete TINYINT(1) DEFAULT NULL'
        );
    }
}
