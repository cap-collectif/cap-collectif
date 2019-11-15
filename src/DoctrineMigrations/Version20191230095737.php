<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191230095737 extends AbstractMigration
{
    static $sourceCategories = [];

    public function preUp(Schema $schema)
    {
        static::$sourceCategories = $this->connection->fetchAll('SELECT * from category');
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7312469DE2');
        $this->addSql('CREATE TABLE source_category (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, isEnabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP INDEX IDX_5F8A7F7312469DE2 ON source');
        $this->addSql('ALTER TABLE source CHANGE category_id source_category_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('CREATE INDEX IDX_5F8A7F732E39CD42 ON source (source_category_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE category (id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\', title VARCHAR(100) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, isEnabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('DROP TABLE source_category');
        $this->addSql('DROP INDEX IDX_5F8A7F732E39CD42 ON source');
        $this->addSql('ALTER TABLE source CHANGE source_category_id category_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7312469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('CREATE INDEX IDX_5F8A7F7312469DE2 ON source (category_id)');
    }

    public function postUp(Schema $schema)
    {
        foreach (static::$sourceCategories as $sourceCategory) {
            $this->connection->insert(
                'source_category',
                $sourceCategory
            );
        }
    }
}
