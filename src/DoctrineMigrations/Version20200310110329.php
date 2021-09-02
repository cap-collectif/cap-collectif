<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200310110329 extends AbstractTranslationMigration
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
            'CREATE TABLE registration_form_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', top_text LONGTEXT NOT NULL, bottom_text LONGTEXT NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_8C3D02492C2AC5D3 (translatable_id), UNIQUE INDEX registration_form_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE registration_form_translation ADD CONSTRAINT FK_8C3D02492C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES registration_form (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE registration_form DROP top_text, DROP bottom_text');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE registration_form_translation');
        $this->addSql(
            'ALTER TABLE registration_form ADD top_text LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD bottom_text LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function getEntityTable(): string
    {
        return 'registration_form';
    }

    public function getTranslationTable(): string
    {
        return 'registration_form_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['top_text', 'bottom_text'];
    }
}
