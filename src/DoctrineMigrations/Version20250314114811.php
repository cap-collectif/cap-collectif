<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250314114811 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Schema modification and field additions for the participation process - collect step';
    }

    public function up(Schema $schema): void
    {
        if (!$this->hasColumn('fos_user', 'consent_privacy_policy')) {
            $this->addSql('ALTER TABLE fos_user ADD consent_privacy_policy TINYINT(1) DEFAULT 0 NOT NULL');
        }
        if (!$this->hasColumn('participant', 'media_id')) {
            $this->addSql('ALTER TABLE participant ADD media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        }
        if (!$this->hasColumn('participant', 'consent_privacy_policy')) {
            $this->addSql('ALTER TABLE participant ADD consent_privacy_policy TINYINT(1) DEFAULT 0 NOT NULL');
        }
        if (!$this->hasForeignKey('participant', 'FK_D79F6B11EA9FDD75')) {
            $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_D79F6B11EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL');
        }
        if (!$this->hasIndex('participant', 'IDX_D79F6B11EA9FDD75')) {
            $this->addSql('CREATE INDEX IDX_D79F6B11EA9FDD75 ON participant (media_id)');
        }
        if (!$this->hasColumn('proposal', 'participant_id')) {
            $this->addSql('ALTER TABLE proposal ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        }
        if (!$this->hasColumn('proposal', 'email_token')) {
            $this->addSql('ALTER TABLE proposal ADD email_token TINYTEXT DEFAULT NULL');
        }
        if (!$this->hasColumn('proposal', 'completion_status')) {
            $this->addSql('ALTER TABLE proposal ADD completion_status VARCHAR(255) DEFAULT \'COMPLETED\' NOT NULL');
        }
        if (!$this->hasForeignKey('proposal', 'FK_BFE594729D1C3019')) {
            $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594729D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        }
        if (!$this->hasIndex('proposal', 'IDX_BFE594729D1C3019')) {
            $this->addSql('CREATE INDEX IDX_BFE594729D1C3019 ON proposal (participant_id)');
        }
    }

    public function down(Schema $schema): void
    {
        if ($this->hasColumn('fos_user', 'consent_privacy_policy')) {
            $this->addSql('ALTER TABLE fos_user DROP consent_privacy_policy');
        }
        if ($this->hasForeignKey('participant', 'FK_D79F6B11EA9FDD75')) {
            $this->addSql('ALTER TABLE participant DROP FOREIGN KEY FK_D79F6B11EA9FDD75');
        }
        if ($this->hasIndex('participant', 'IDX_D79F6B11EA9FDD75')) {
            $this->addSql('DROP INDEX IDX_D79F6B11EA9FDD75 ON participant');
        }
        if ($this->hasColumn('participant', 'media_id')) {
            $this->addSql('ALTER TABLE participant DROP media_id');
        }
        if ($this->hasColumn('participant', 'consent_privacy_policy')) {
            $this->addSql('ALTER TABLE participant DROP consent_privacy_policy');
        }
        if ($this->hasForeignKey('proposal', 'FK_BFE594729D1C3019')) {
            $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594729D1C3019');
        }
        if ($this->hasIndex('proposal', 'IDX_BFE594729D1C3019')) {
            $this->addSql('DROP INDEX IDX_BFE594729D1C3019 ON proposal');
        }
        if ($this->hasColumn('proposal', 'participant_id')) {
            $this->addSql('ALTER TABLE proposal DROP participant_id');
        }
        if ($this->hasColumn('proposal', 'email_token')) {
            $this->addSql('ALTER TABLE proposal DROP email_token');
        }
        if ($this->hasColumn('proposal', 'completion_status')) {
            $this->addSql('ALTER TABLE proposal DROP completion_status');
        }
    }

    private function hasColumn(string $tableName, string $columnName): bool
    {
        return \array_key_exists(
            strtolower($columnName),
            array_change_key_case($this->connection->getSchemaManager()->listTableColumns($tableName), CASE_LOWER)
        );
    }

    private function hasForeignKey(string $tableName, string $foreignKeyName): bool
    {
        return \array_key_exists(
            strtolower($foreignKeyName),
            array_change_key_case($this->connection->getSchemaManager()->listTableForeignKeys($tableName), CASE_LOWER)
        );
    }

    private function hasIndex(string $tableName, string $indexName): bool
    {
        return \array_key_exists(
            strtolower($indexName),
            array_change_key_case($this->connection->getSchemaManager()->listTableIndexes($tableName), CASE_LOWER)
        );
    }
}
