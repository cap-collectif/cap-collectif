<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20171113172350 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE proposal_form ADD commentable TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form DROP commentable');
    }
}
