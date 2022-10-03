<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220930114146 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'district_translation.description';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district_translation ADD description LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district_translation DROP description');
    }
}
