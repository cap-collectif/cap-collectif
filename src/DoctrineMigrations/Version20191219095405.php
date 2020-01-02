<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191219095405 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            "CREATE TABLE user_type_translation (id INT AUTO_INCREMENT NOT NULL, translatable_id CHAR(36) DEFAULT NULL COMMENT '(DC2Type:guid)',  slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, name VARCHAR(255) NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_8265D0232C2AC5D3 (translatable_id), UNIQUE INDEX user_type_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB"
        );
        $this->addSql(
            'ALTER TABLE user_type_translation ADD CONSTRAINT FK_8265D0232C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES user_type (id) ON DELETE CASCADE'
        );
        $this->addTranslations();
        $this->addSql('DROP INDEX UNIQ_F65F1BE05E237E06 ON user_type');
        $this->addSql('ALTER TABLE user_type DROP slug, DROP name');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE user_type ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD name VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->removeTranslations();
        $this->addSql('DROP TABLE user_type_translation');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F65F1BE05E237E06 ON user_type (name)');
    }

    public function addTranslations(): void
    {
        $userTypes = $this->connection->fetchAll('SELECT * FROM user_type');
        $locale = $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default = TRUE');
        foreach ($userTypes as $userType) {
            $this->addSql(
                "INSERT INTO user_type_translation (translatable_id, slug, name, locale) VALUES ('" .
                    $userType['id'] .
                    "', '" .
                    $userType['slug'] .
                    "', '" .
                    $userType['name'] .
                    "', '" .
                    $locale .
                    "')"
            );
        }
    }

    public function removeTranslations(): void
    {
        $locale = $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default = TRUE');
        $userTypeDefaultTranslations = $this->connection->fetchAll(
            "SELECT * FROM user_type_translation WHERE locale = '" . $locale . "'"
        );
        foreach ($userTypeDefaultTranslations as $userTypeDefaultTranslation) {
            $this->addSql(
                "UPDATE user_type SET name = '" .
                    $userTypeDefaultTranslation['name'] .
                    "', slug='" .
                    $userTypeDefaultTranslation['slug'] .
                    "' WHERE id = '" .
                    $userTypeDefaultTranslation['id'] .
                    "'"
            );
        }
    }
}
