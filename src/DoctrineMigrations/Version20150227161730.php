<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150227161730 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE comment (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, idea_id INT DEFAULT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, vote_count INT NOT NULL, author_name VARCHAR(255) DEFAULT NULL, author_email VARCHAR(255) DEFAULT NULL, author_ip VARCHAR(255) DEFAULT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_9474526CF675F31B (author_id), INDEX IDX_9474526C5B6FEF7D (idea_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE comment_vote (id INT AUTO_INCREMENT NOT NULL, comment_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_7C262788F8697D13 (comment_id), INDEX IDX_7C262788EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526CF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526C5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE comment_vote ADD CONSTRAINT FK_7C262788F8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql(
            'ALTER TABLE comment_vote ADD CONSTRAINT FK_7C262788EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE idea ADD comments_count INT NOT NULL');
        $this->addSql('ALTER TABLE reporting ADD comment_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql('CREATE INDEX IDX_BD7CFA9FF8697D13 ON reporting (comment_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment_vote DROP FOREIGN KEY FK_7C262788F8697D13');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FF8697D13');
        $this->addSql('DROP TABLE comment');
        $this->addSql('DROP TABLE comment_vote');
        $this->addSql('ALTER TABLE idea DROP comments_count');
        $this->addSql('DROP INDEX IDX_BD7CFA9FF8697D13 ON reporting');
        $this->addSql('ALTER TABLE reporting DROP comment_id');
    }
}
