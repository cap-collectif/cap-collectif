<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211124152431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'section_translation title not null';
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update('section_translation', ['title' => ''], ['title' => null]);
    }
}
