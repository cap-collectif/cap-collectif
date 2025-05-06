<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20180321145712 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX comment_vote_unique ON votes (voter_id, comment_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX comment_vote_unique ON votes');
    }
}
