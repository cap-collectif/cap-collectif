<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20230911130028 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'proposal_form set costable to false';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form CHANGE costable costable TINYINT(1) DEFAULT \'0\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form CHANGE costable costable TINYINT(1) DEFAULT \'1\' NOT NULL');
    }
}
