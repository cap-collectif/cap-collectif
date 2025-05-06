<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210128144209 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove no more used counters on step table.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE step DROP opinion_count, DROP trashed_opinion_count, DROP opinion_versions_count, DROP trashed_opinion_versions_count, DROP argument_count, DROP trashed_argument_count, DROP sources_count, DROP trashed_sources_count'
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
            'ALTER TABLE step ADD opinion_count INT DEFAULT NULL, ADD trashed_opinion_count INT DEFAULT NULL, ADD opinion_versions_count INT DEFAULT NULL, ADD trashed_opinion_versions_count INT DEFAULT NULL, ADD argument_count INT DEFAULT NULL, ADD trashed_argument_count INT DEFAULT NULL, ADD sources_count INT DEFAULT NULL, ADD trashed_sources_count INT DEFAULT NULL'
        );
    }
}
