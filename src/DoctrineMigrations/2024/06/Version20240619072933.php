<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240619072933 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add proposal_step_split_view_enabled column to project table.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ADD proposal_step_split_view_enabled TINYINT(1) DEFAULT \'0\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP proposal_step_split_view_enabled');
    }
}
