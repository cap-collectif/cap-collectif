<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260324143215 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Allow proposal decision drafts without a chosen approval';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_decision CHANGE is_approved is_approved TINYINT(1) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // Intentionally left empty: leaving the column nullable is harmless and avoids data corruption.
    }
}
