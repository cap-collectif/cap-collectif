<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20150925074626 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema): void
    {
        $opinionVotes = $this->connection->fetchAll(
            'SELECT id FROM votes v WHERE v.confirmed = 0 AND v.voteType = "opinion"'
        );
        $opinionVersionVotes = $this->connection->fetchAll(
            'SELECT id FROM votes v WHERE v.confirmed = 0 AND v.voteType = "opinionVersion"'
        );
        $argumentVotes = $this->connection->fetchAll(
            'SELECT id FROM votes v WHERE v.confirmed = 0 AND v.voteType = "argument"'
        );
        $sourceVotes = $this->connection->fetchAll(
            'SELECT id FROM votes v WHERE v.confirmed = 0 AND v.voteType = "source"'
        );

        $votes = array_merge($opinionVotes, $opinionVersionVotes, $argumentVotes, $sourceVotes);
        foreach ($votes as $vote) {
            $this->connection->delete('votes', ['id' => $vote['id']]);
        }
        echo 'Deleted : ' . \count($votes) . ' vote(s) !';
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }
}
