<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190220111958 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->connection->update('section', ['type' => 'metrics'], ['type' => 'figures']);

        $this->addSql(
            'ALTER TABLE section ADD metrics_to_display_basics TINYINT(1) NOT NULL, ADD metrics_to_display_events TINYINT(1) NOT NULL, ADD metrics_to_display_projects TINYINT(1) NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE section DROP metrics_to_display_basics, DROP metrics_to_display_events, DROP metrics_to_display_projects'
        );
    }
}
