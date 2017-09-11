<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170905121622 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C154875FF69B7D');
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT NOT NULL');
        $this->addSql('CREATE INDEX IDX_31C154875FF69B7D ON district (form_id)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT DEFAULT NULL');
    }
}
