<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231124131515 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove participant -> proposal relation';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594729D1C3019');
        $this->addSql('DROP INDEX IDX_BFE594729D1C3019 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP participant_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE proposal ADD participant_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594729D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_BFE594729D1C3019 ON proposal (participant_id)');
    }
}
