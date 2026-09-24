<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260924120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove questionnaire private results';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE questionnaire DROP private_result');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE questionnaire ADD private_result TINYINT(1) NOT NULL DEFAULT 0');
    }
}
