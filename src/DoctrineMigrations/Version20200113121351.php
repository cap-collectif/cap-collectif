<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractTranslationMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20200113121351 extends AbstractTranslationMigration
{
    public function getEntityTable(): string
    {
        return 'district';
    }

    public function getTranslationTable(): string
    {
        return 'district_translation';
    }

    public function getFieldsToTranslate(): array
    {
        return ['name'];
    }

    public function getDescription(): string
    {
        return 'translate districts';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE district_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_98DB6E562C2AC5D3 (translatable_id), UNIQUE INDEX district_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE district_translation ADD CONSTRAINT FK_98DB6E562C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES district (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE district DROP name');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE district_translation');
        $this->addSql(
            'ALTER TABLE district ADD name VARCHAR(100) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
