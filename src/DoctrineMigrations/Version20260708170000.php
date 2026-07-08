<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260708170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add EMAIL_VERIFIED requirement to opened collect steps';
    }

    public function up(Schema $schema): void
    {
        $sql = <<<'SQL'
            INSERT INTO requirement (id, step_id, type, `label`, position)
            SELECT UUID(), s.id, 'EMAIL_VERIFIED', null, 0
            FROM step s
            WHERE s.step_type = 'collect'
                AND (
                    s.timeless = 1
                    OR (
                        s.start_at IS NOT NULL
                        AND s.start_at <= NOW()
                        AND (s.end_at IS NULL OR s.end_at >= NOW())
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM requirement r
                    WHERE r.step_id = s.id
                        AND r.type = 'EMAIL_VERIFIED'
                )
            SQL;

        $this->addSql($sql);
    }

    public function down(Schema $schema): void
    {
    }
}
