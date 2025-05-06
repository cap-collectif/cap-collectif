<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20221125103057 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'section.zoom_map';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section ADD zoom_map INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section DROP zoom_map');
    }
}
