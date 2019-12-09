<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180201120618 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        for ($i = 0; $i < 10; $i++) {
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE opinion_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, opinion_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE opinion_version_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, opinion_version_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE argument_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, argument_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE source_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, source_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE idea_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, idea_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE comment_id IS NOT NULL AND voter_id IS NOT NULL group by voter_id, comment_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE proposal_id IS NOT NULL AND voter_id IS NOT NULL AND selection_step_id IS NOT NULL group by voter_id, proposal_id, selection_step_id having count(*) > 1) AS something)'
            );
            $this->addSql(
                'DELETE FROM votes WHERE id IN (SELECT id FROM (SELECT * FROM votes WHERE proposal_id IS NOT NULL AND voter_id IS NOT NULL AND collect_step_id IS NOT NULL group by voter_id, proposal_id, collect_step_id having count(*) > 1) AS something)'
            );
        }
        $this->addSql('CREATE UNIQUE INDEX opinion_vote_unique ON votes (voter_id, opinion_id)');
        $this->addSql('CREATE UNIQUE INDEX argument_vote_unique ON votes (voter_id, argument_id)');
        $this->addSql(
            'CREATE UNIQUE INDEX opinion_version_vote_unique ON votes (voter_id, opinion_version_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX selection_step_vote_unique ON votes (voter_id, proposal_id, selection_step_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX collect_step_vote_unique ON votes (voter_id, proposal_id, collect_step_id)'
        );
        $this->addSql('CREATE UNIQUE INDEX source_vote_unique ON votes (voter_id, source_id)');
        $this->addSql('CREATE UNIQUE INDEX comment_vote_unique ON votes (voter_id, comment_id)');
        $this->addSql('CREATE UNIQUE INDEX idea_vote_unique ON votes (voter_id, idea_id)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('DROP INDEX opinion_vote_unique ON votes');
        $this->addSql('DROP INDEX argument_vote_unique ON votes');
        $this->addSql('DROP INDEX opinion_version_vote_unique ON votes');
        $this->addSql('DROP INDEX selection_step_vote_unique ON votes');
        $this->addSql('DROP INDEX collect_step_vote_unique ON votes');
        $this->addSql('DROP INDEX source_vote_unique ON votes');
        $this->addSql('DROP INDEX comment_vote_unique ON votes');
        $this->addSql('DROP INDEX idea_vote_unique ON votes');
    }
}
