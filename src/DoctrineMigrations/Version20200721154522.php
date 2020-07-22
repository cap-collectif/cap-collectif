<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200721154522 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add view configuration to project and step';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step ADD main_view VARCHAR(255) DEFAULT \'grid\'');
        $this->addSql(
            'ALTER TABLE proposal_form ADD grid_view_enabled TINYINT(1) DEFAULT \'1\' NOT NULL, ADD list_view_enabled TINYINT(1) DEFAULT \'1\' NOT NULL, ADD map_view_enabled TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal_form DROP grid_view_enabled, DROP list_view_enabled, DROP map_view_enabled'
        );
        $this->addSql('ALTER TABLE step DROP main_view');
    }
}
