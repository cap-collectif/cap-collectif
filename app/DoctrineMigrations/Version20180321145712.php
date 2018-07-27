<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180321145712 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('CREATE UNIQUE INDEX comment_vote_unique ON votes (voter_id, comment_id)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('DROP INDEX comment_vote_unique ON votes');
    }
}
