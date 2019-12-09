<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170905121622 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C154875FF69B7D');
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT NOT NULL');
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C154875FF69B7D FOREIGN KEY (form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district CHANGE form_id form_id INT DEFAULT NULL');
    }
}
