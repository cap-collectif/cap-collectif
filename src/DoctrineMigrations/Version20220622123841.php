<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220622123841 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'organization.translation';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE organization_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_8435E1142C2AC5D3 (translatable_id), UNIQUE INDEX organization_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE organization_translation ADD CONSTRAINT FK_8435E1142C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES organization (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE organization DROP body, DROP slug, DROP title');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE organization_translation');
        $this->addSql(
            'ALTER TABLE organization ADD body LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
