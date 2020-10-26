<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201023102557 extends AbstractMigration
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
            'CREATE TABLE debate_opinion (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', debate_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', author_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME DEFAULT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, type INT NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_511BC4ED39A6B6F6 (debate_id), INDEX IDX_511BC4EDF675F31B (author_id), INDEX idx_author (id, author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE debate_argument (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', debate_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', author_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME DEFAULT NULL, votes_count INT NOT NULL, body LONGTEXT NOT NULL, moderation_token VARCHAR(255) NOT NULL, published TINYINT(1) NOT NULL, publishedAt DATETIME DEFAULT NULL, trashed_status ENUM(\'visible\', \'invisible\'), trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, type INT NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_765A09D0AC6D46AF (moderation_token), INDEX IDX_765A09D039A6B6F6 (debate_id), INDEX IDX_765A09D0F675F31B (author_id), INDEX idx_author (id, author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE debate (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', UNIQUE INDEX UNIQ_DDC4A36873B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE debate_opinion ADD CONSTRAINT FK_511BC4ED39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE debate_opinion ADD CONSTRAINT FK_511BC4EDF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE debate_argument ADD CONSTRAINT FK_765A09D039A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE debate_argument ADD CONSTRAINT FK_765A09D0F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE debate ADD CONSTRAINT FK_DDC4A36873B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD yes_no_value INT DEFAULT NULL, ADD debate_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql('CREATE INDEX IDX_518B7ACF39A6B6F6 ON votes (debate_id)');
        $this->addSql(
            'ALTER TABLE reporting ADD debate_argument_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FB1B4F3D5 FOREIGN KEY (debate_argument_id) REFERENCES debate_argument (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_BD7CFA9FB1B4F3D5 ON reporting (debate_argument_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FB1B4F3D5');
        $this->addSql('ALTER TABLE debate_opinion DROP FOREIGN KEY FK_511BC4ED39A6B6F6');
        $this->addSql('ALTER TABLE debate_argument DROP FOREIGN KEY FK_765A09D039A6B6F6');
        $this->addSql('DROP TABLE debate_opinion');
        $this->addSql('DROP TABLE debate_argument');
        $this->addSql('DROP TABLE debate');
        $this->addSql('DROP INDEX IDX_BD7CFA9FB1B4F3D5 ON reporting');
        $this->addSql('ALTER TABLE reporting DROP debate_argument_id');
        $this->addSql('DROP INDEX IDX_518B7ACF39A6B6F6 ON votes');
        $this->addSql('ALTER TABLE votes DROP yes_no_value, DROP debate_id');
    }
}
