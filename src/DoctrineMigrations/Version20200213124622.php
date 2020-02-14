<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200213124622 extends AbstractTranslationMigration
{
    public function getEntityTable(): string
    {
        return 'section';
    }

    public function getTranslationTable(): string
    {
        return 'section_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['title', 'teaser', 'body'];
    }

    public function getDescription(): string
    {
        return 'Migrate section to a translated section';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE section_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(100) DEFAULT NULL, teaser LONGTEXT DEFAULT NULL, body LONGTEXT DEFAULT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_A2983A102C2AC5D3 (translatable_id), UNIQUE INDEX section_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE section_translation ADD CONSTRAINT FK_A2983A102C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES section (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE section DROP title, DROP teaser, DROP body');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE section ADD body LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD title VARCHAR(100) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD teaser LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('DROP TABLE section_translation');
    }
}
