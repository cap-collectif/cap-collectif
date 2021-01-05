<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210104131312 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add debate as ProjectType';
    }

    public function up(Schema $schema): void
    {
        $this->connection
            ->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'global.debate')
            ->setParameter(1, 'debate')
            ->setParameter(2, '#7ED6DF')
            ->execute();
    }

    public function down(Schema $schema): void
    {
        $this->connection->delete('project_type', ['slug' => 'debate']);
    }
}
