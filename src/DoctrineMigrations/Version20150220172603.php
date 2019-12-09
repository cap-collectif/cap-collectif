<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150220172603 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE video (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) DEFAULT NULL, slug VARCHAR(255) DEFAULT NULL, body LONGTEXT DEFAULT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, position INT DEFAULT NULL, color VARCHAR(50) NOT NULL, video VARCHAR(255) NOT NULL, INDEX IDX_7CC7DA2CF675F31B (author_id), UNIQUE INDEX UNIQ_7CC7DA2CEA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE video ADD CONSTRAINT FK_7CC7DA2CF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE video ADD CONSTRAINT FK_7CC7DA2CEA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA759027487');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA7F675F31B');
        $this->addSql('ALTER TABLE event DROP nameAddress');
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA759027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA7F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE video');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA759027487');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA7F675F31B');
        $this->addSql(
            'ALTER TABLE event ADD nameAddress VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA759027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA7F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
    }
}
