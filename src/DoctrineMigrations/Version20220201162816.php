<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220201162816 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'step.main_view as enum';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE step CHANGE main_view main_view VARCHAR(255) DEFAULT \'GRID\''
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE step CHANGE main_view main_view VARCHAR(255) CHARACTER SET utf8 DEFAULT \'grid\' COLLATE `utf8_unicode_ci`'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update('step', ['main_view' => 'GRID'], ['main_view' => 'grid']);
        $this->connection->update('step', ['main_view' => 'LIST'], ['main_view' => 'list']);
        $this->connection->update('step', ['main_view' => 'MAP'], ['main_view' => 'map']);
    }
}
