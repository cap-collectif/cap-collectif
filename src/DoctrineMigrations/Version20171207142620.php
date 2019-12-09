<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171207142620 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // delete from responses_medias;
        // delete from response where id IN (select * from (select id from response GROUP BY proposal_id, question_id HAVING (COUNT(*) > 1)) AS A);
        $this->addSql(
            'CREATE UNIQUE INDEX proposal_response_unique ON response (proposal_id, question_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX evaluation_response_unique ON response (evaluation_id, question_id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX proposal_response_unique ON response');
        $this->addSql('DROP INDEX evaluation_response_unique ON response');
    }
}
