<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261007120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add menu_item.is_external_link';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE menu_item ADD is_external_link TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE menu_item DROP is_external_link');
    }
}
