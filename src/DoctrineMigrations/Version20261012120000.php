<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261012120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add vocal contribution activation to collect steps';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE step ADD is_vocal_contribution_enabled TINYINT(1) DEFAULT '0'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP is_vocal_contribution_enabled');
    }
}
