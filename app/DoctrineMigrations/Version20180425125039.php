<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180425125039 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C5B6FEF7D');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD285B6FEF7D');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F5B6FEF7D');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF5B6FEF7D');
        $this->addSql('DROP TABLE idea');
        $this->addSql('DROP INDEX IDX_BD7CFA9F5B6FEF7D ON reporting');
        $this->addSql('ALTER TABLE reporting DROP idea_id');
        $this->addSql('DROP INDEX idea_vote_unique ON votes');
        $this->addSql('DROP INDEX IDX_518B7ACF5B6FEF7D ON votes');
        $this->addSql('ALTER TABLE votes DROP idea_id');
        $this->addSql('DROP INDEX IDX_9474526C5B6FEF7D ON comment');
        $this->addSql('ALTER TABLE comment DROP idea_id');
        $this->addSql('DROP INDEX IDX_5143CD285B6FEF7D ON highlighted_content');
        $this->addSql('ALTER TABLE highlighted_content DROP idea_id');
        $this->addSql(
            'ALTER TABLE fos_user DROP idea_comments_count, DROP idea_votes_count, DROP ideas_count'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE idea (id INT AUTO_INCREMENT NOT NULL, media_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', theme_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', author_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', title VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, slug VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, object LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci, url VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, is_enabled TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci, comments_count INT NOT NULL, is_commentable TINYINT(1) NOT NULL, validated TINYINT(1) NOT NULL, votes_count INT NOT NULL, created_at DATETIME NOT NULL, expired TINYINT(1) NOT NULL, body LONGTEXT NOT NULL COLLATE utf8_unicode_ci, UNIQUE INDEX UNIQ_A8BCA45EA9FDD75 (media_id), INDEX IDX_A8BCA4559027487 (theme_id), INDEX IDX_A8BCA45F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA4559027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE comment ADD idea_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526C5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_9474526C5B6FEF7D ON comment (idea_id)');
        $this->addSql(
            'ALTER TABLE fos_user ADD idea_comments_count INT NOT NULL, ADD idea_votes_count INT NOT NULL, ADD ideas_count INT NOT NULL'
        );
        $this->addSql('ALTER TABLE highlighted_content ADD idea_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD285B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_5143CD285B6FEF7D ON highlighted_content (idea_id)');
        $this->addSql('ALTER TABLE reporting ADD idea_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_BD7CFA9F5B6FEF7D ON reporting (idea_id)');
        $this->addSql('ALTER TABLE votes ADD idea_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE UNIQUE INDEX idea_vote_unique ON votes (voter_id, idea_id)');
        $this->addSql('CREATE INDEX IDX_518B7ACF5B6FEF7D ON votes (idea_id)');
    }
}
