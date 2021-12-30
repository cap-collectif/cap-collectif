<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211228100250 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'proposal.paper_votes_count';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal ADD paper_votes_count INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal DROP paper_votes_count');
    }
}
