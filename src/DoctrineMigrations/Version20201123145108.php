<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201123145108 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add debate_article';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE debate_article (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', debate_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME DEFAULT NULL, url VARCHAR(255) NOT NULL, origin VARCHAR(255) DEFAULT NULL, cover_url VARCHAR(255) DEFAULT NULL, title VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, published_at DATETIME DEFAULT NULL, crawled_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_F8237AAC39A6B6F6 (debate_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE debate_article ADD CONSTRAINT FK_F8237AAC39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE debate_article');
    }
}
