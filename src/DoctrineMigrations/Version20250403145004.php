<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250403145004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add CONSENT_PRIVACY_POLICY to old steps';
    }

    public function up(Schema $schema): void
    {
        $sql = <<<'SQL'
                        INSERT INTO requirement
                        SELECT UUID(), r.step_id, 'CONSENT_PRIVACY_POLICY', null, 0
                        FROM requirement r
                        GROUP BY r.step_id
            SQL;

        $this->addSql($sql);
    }

    public function down(Schema $schema): void
    {
    }
}
