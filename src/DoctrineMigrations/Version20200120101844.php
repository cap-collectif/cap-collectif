<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20200120101844 extends AbstractTranslationMigration
{
    public function getEntityTable(): string
    {
        return 'menu_item';
    }

    public function getTranslationTable(): string
    {
        return 'menu_item_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['title', 'link'];
    }

    public function getDescription(): string
    {
        return 'translate menu_item';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE menu_item_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, link VARCHAR(255) DEFAULT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_683EE3A62C2AC5D3 (translatable_id), UNIQUE INDEX menu_item_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE menu_item_translation ADD CONSTRAINT FK_683EE3A62C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES menu_item (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE menu_item DROP title, DROP link');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE menu_item ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD link VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('DROP TABLE menu_item_translation');
    }
}
