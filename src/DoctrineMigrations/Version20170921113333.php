<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20170921113333 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE proposal_form ADD summary_help_text VARCHAR(255) DEFAULT NULL, ADD illustration_help_text VARCHAR(255) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE proposal_form DROP summary_help_text, DROP illustration_help_text'
        );
    }
}
