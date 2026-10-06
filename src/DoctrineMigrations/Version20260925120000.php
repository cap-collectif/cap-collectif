<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260925120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Associate Hub metadata with its project';
    }

    public function up(Schema $schema): void
    {
        $orphanedMetadataCount = (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM hub_metadata hm LEFT JOIN project_abstractstep pas ON pas.step_id = hm.step_id WHERE pas.project_id IS NULL'
        );
        if ($orphanedMetadataCount > 0) {
            throw new \RuntimeException(sprintf(
                '%d Hub metadata records are not associated with a project.',
                $orphanedMetadataCount
            ));
        }

        $duplicateProjectCount = (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM (SELECT pas.project_id FROM hub_metadata hm INNER JOIN project_abstractstep pas ON pas.step_id = hm.step_id GROUP BY pas.project_id HAVING COUNT(*) > 1) duplicates'
        );
        if ($duplicateProjectCount > 0) {
            throw new \RuntimeException(sprintf(
                '%d projects have multiple Hub metadata records.',
                $duplicateProjectCount
            ));
        }

        $this->addSql('ALTER TABLE hub_metadata ADD project_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE hub_metadata ADD CONSTRAINT FK_HUB_METADATA_PROJECT FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('UPDATE hub_metadata hm INNER JOIN project_abstractstep pas ON pas.step_id = hm.step_id SET hm.project_id = pas.project_id');
        $this->addSql('CREATE UNIQUE INDEX hub_metadata_project_unique ON hub_metadata (project_id)');
        $this->addSql('ALTER TABLE hub_metadata MODIFY project_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE hub_metadata DROP FOREIGN KEY FK_HUB_METADATA_PROJECT');
        $this->addSql('DROP INDEX hub_metadata_project_unique ON hub_metadata');
        $this->addSql('ALTER TABLE hub_metadata DROP project_id');
    }
}
