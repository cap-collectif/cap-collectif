<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20230712091259 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add proposal_archived_time and proposal_archived_unit_time to step';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step ADD proposal_archived_time INT DEFAULT 0, ADD proposal_archived_unit_time VARCHAR(255) DEFAULT \'MONTHS\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP proposal_archived_time, DROP proposal_archived_unit_time');
    }
}
