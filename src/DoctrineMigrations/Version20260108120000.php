<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260108120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'backfill participant last_contributed_at from votes and replies';
    }

    public function up(Schema $schema): void
    {
        $sql = <<<'SQL'
            UPDATE participant p
                LEFT JOIN (
                    SELECT participant_id, MAX(created_at) AS last_vote_at
                    FROM votes
                    WHERE participant_id IS NOT NULL
                    GROUP BY participant_id
                ) v ON v.participant_id = p.id
                LEFT JOIN (
                    SELECT participant_id, MAX(created_at) AS last_reply_at
                    FROM reply
                    WHERE participant_id IS NOT NULL
                    GROUP BY participant_id
                ) r ON r.participant_id = p.id
            SET p.last_contributed_at = CASE
                                            WHEN v.last_vote_at IS NULL AND r.last_reply_at IS NULL THEN p.created_at
                                            WHEN v.last_vote_at IS NULL THEN r.last_reply_at
                                            WHEN r.last_reply_at IS NULL THEN v.last_vote_at
                                            ELSE GREATEST(v.last_vote_at, r.last_reply_at)
                END
            WHERE p.last_contributed_at IS NULL;
            SQL;

        $this->addSql($sql);
    }

    public function down(Schema $schema): void
    {
    }
}
