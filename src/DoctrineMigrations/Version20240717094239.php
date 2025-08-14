<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240717094239 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add completion_status to vote table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE votes ADD completion_status VARCHAR(255) DEFAULT \'COMPLETED\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE votes DROP completion_status');
    }
}
