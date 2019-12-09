<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170130181347 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user ADD new_email_to_confirm VARCHAR(255) DEFAULT NULL, ADD new_email_confirmation_token VARCHAR(255) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user DROP new_email_to_confirm, DROP new_email_confirmation_token'
        );
    }
}
