<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200206102839 extends AbstractTranslationMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE contact_form_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', confidentiality LONGTEXT DEFAULT NULL, body LONGTEXT NOT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_82F8DFEA2C2AC5D3 (translatable_id), UNIQUE INDEX contact_form_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE contact_form_translation ADD CONSTRAINT FK_82F8DFEA2C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES contact_form (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE contact_form DROP confidentiality, DROP slug, DROP title, DROP body'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE contact_form_translation');
        $this->addSql(
            'ALTER TABLE contact_form ADD confidentiality LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD body LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function getEntityTable(): string
    {
        return 'contact_form';
    }

    public function getTranslationTable(): string
    {
        return 'contact_form_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['title', 'slug', 'confidentiality', 'body'];
    }
}
