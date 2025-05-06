<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250402142458 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'update consultation owner';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE consultation SET owner_id = null WHERE organizationOwner_id IS NOT NULL');
    }

    public function down(Schema $schema): void
    {
    }
}
