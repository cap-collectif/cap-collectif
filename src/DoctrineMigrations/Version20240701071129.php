<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240701071129 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'drop collect_participants_email from step';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP collect_participants_email');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step ADD collect_participants_email TINYINT(1) DEFAULT \'0\'');
    }
}
