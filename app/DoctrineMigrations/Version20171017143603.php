<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171017143603 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3E7B0BFB1E27F6BF456C5646 ON response (question_id, evaluation_id)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('DROP INDEX UNIQ_3E7B0BFB1E27F6BF456C5646 ON response');
    }
}
