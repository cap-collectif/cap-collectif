<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240718103820 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add EMAIL_VERIFIED to selection and questionnaire steps that does not allow anonymous participation';
    }

    public function up(Schema $schema): void
    {
        $sql = <<<'SQL'
                            INSERT INTO requirement
                            SELECT UUID(), s.id, 'EMAIL_VERIFIED', null, 0
                            FROM step s
                            WHERE s.step_type IN ('collect', 'selection', 'questionnaire') AND (s.is_anonymous_participation_allowed = 0 AND (s.is_proposal_sms_vote_enabled = 0 OR s.is_proposal_sms_vote_enabled IS NULL));
            SQL;

        $this->addSql($sql);
    }

    public function down(Schema $schema): void
    {
    }
}
