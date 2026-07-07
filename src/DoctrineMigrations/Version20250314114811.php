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
        $this->addSql('ALTER TABLE fos_user ADD consent_privacy_policy TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE participant ADD media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD consent_privacy_policy TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_D79F6B11EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_D79F6B11EA9FDD75 ON participant (media_id)');
        $this->addSql('ALTER TABLE proposal ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD email_token TINYTEXT DEFAULT NULL, ADD completion_status VARCHAR(255) DEFAULT \'COMPLETED\' NOT NULL');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594729D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_BFE594729D1C3019 ON proposal (participant_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP consent_privacy_policy');
        $this->addSql('ALTER TABLE participant DROP FOREIGN KEY FK_D79F6B11EA9FDD75');
        $this->addSql('DROP INDEX IDX_D79F6B11EA9FDD75 ON participant');
        $this->addSql('ALTER TABLE participant DROP media_id, DROP consent_privacy_policy');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594729D1C3019');
        $this->addSql('DROP INDEX IDX_BFE594729D1C3019 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP participant_id, DROP email_token, DROP completion_status');
    }
}
