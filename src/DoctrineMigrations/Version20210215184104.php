<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210215184104 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation DROP opinion_count, DROP trashed_opinion_count, DROP opinion_versions_count, DROP trashed_opinion_versions_count, DROP argument_count, DROP trashed_argument_count, DROP sources_count, DROP trashed_sources_count, DROP votes_count, DROP contributors_count'
        );
        $this->addSql(
            'ALTER TABLE step DROP votes_count, DROP contributors_count, DROP replies_count'
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
            'ALTER TABLE consultation ADD opinion_count INT NOT NULL, ADD trashed_opinion_count INT NOT NULL, ADD opinion_versions_count INT NOT NULL, ADD trashed_opinion_versions_count INT NOT NULL, ADD argument_count INT NOT NULL, ADD trashed_argument_count INT NOT NULL, ADD sources_count INT NOT NULL, ADD trashed_sources_count INT NOT NULL, ADD votes_count INT NOT NULL, ADD contributors_count INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE step ADD votes_count INT DEFAULT NULL, ADD contributors_count INT DEFAULT NULL, ADD replies_count INT DEFAULT NULL'
        );
    }
}
