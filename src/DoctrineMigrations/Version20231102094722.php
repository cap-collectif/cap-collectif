<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231102094722 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add created_at to participant';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participant ADD created_at DATETIME NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participant DROP created_at');
    }
}
