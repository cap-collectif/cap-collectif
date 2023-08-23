<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20230712082735 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add is_archived to proposal table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal ADD is_archived TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal DROP is_archived');
    }
}
