<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20200303091251 extends AbstractTranslationMigration
{
    public function getDescription(): string
    {
        return 'Translate event';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE event_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', slug VARCHAR(255) NOT NULL, link VARCHAR(255) DEFAULT NULL, body LONGTEXT NOT NULL, meta_description VARCHAR(160) DEFAULT NULL, title VARCHAR(255) NOT NULL, locale VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_1FE096EF989D9B62 (slug), INDEX IDX_1FE096EF2C2AC5D3 (translatable_id), UNIQUE INDEX event_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE event_translation ADD CONSTRAINT FK_1FE096EF2C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP INDEX UNIQ_3BAE0AA7989D9B62 ON event');
        $this->addSql(
            'ALTER TABLE event DROP slug, DROP link, DROP body, DROP meta_description, DROP title'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE event_translation');
        $this->addSql(
            'ALTER TABLE event ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD link VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD body LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD meta_description VARCHAR(160) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3BAE0AA7989D9B62 ON event (slug)');
    }

    public function getEntityTable(): string
    {
        return 'event';
    }

    public function getTranslationTable(): string
    {
        return 'event_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['title', 'slug', 'link', 'body', 'meta_description'];
    }
}
