<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150819105432 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE opinion_appendices (id INT AUTO_INCREMENT NOT NULL, opinion_type_part_id INT DEFAULT NULL, opinion_id INT DEFAULT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_CE7C748A8DAE1A1E (opinion_type_part_id), INDEX IDX_CE7C748A51885A6A (opinion_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_type_appendices_type (id INT AUTO_INCREMENT NOT NULL, opinion_type_id INT NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, position INT NOT NULL, INDEX IDX_A4C8254928FD468D (opinion_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_version (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, parent_id INT DEFAULT NULL, body LONGTEXT NOT NULL, comment LONGTEXT DEFAULT NULL, sources_count INT NOT NULL, arguments_count INT NOT NULL, trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, enabled TINYINT(1) NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, vote_count_nok INT NOT NULL, vote_count_ok INT NOT NULL, vote_count_mitige INT NOT NULL, INDEX IDX_52AD19DDF675F31B (author_id), INDEX IDX_52AD19DD727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_CE7C748A8DAE1A1E FOREIGN KEY (opinion_type_part_id) REFERENCES opinion_type_appendices_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_CE7C748A51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_type_appendices_type ADD CONSTRAINT FK_A4C8254928FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DDF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DD727ACA70 FOREIGN KEY (parent_id) REFERENCES opinion (id)'
        );
        $this->addSql('ALTER TABLE votes ADD opinion_version_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFD077154C FOREIGN KEY (opinion_version_id) REFERENCES opinion_version (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACFD077154C ON votes (opinion_version_id)');
        $this->addSql('ALTER TABLE argument ADD opinion_version_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0AD077154C FOREIGN KEY (opinion_version_id) REFERENCES opinion_version (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_D113B0AD077154C ON argument (opinion_version_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_appendices DROP FOREIGN KEY FK_CE7C748A8DAE1A1E');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFD077154C');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0AD077154C');
        $this->addSql('DROP TABLE opinion_appendices');
        $this->addSql('DROP TABLE opinion_type_appendices_type');
        $this->addSql('DROP TABLE opinion_version');
        $this->addSql('DROP INDEX IDX_D113B0AD077154C ON argument');
        $this->addSql('ALTER TABLE argument DROP opinion_version_id');
        $this->addSql('DROP INDEX IDX_518B7ACFD077154C ON votes');
        $this->addSql('ALTER TABLE votes DROP opinion_version_id');
    }
}
