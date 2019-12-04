<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151026122008 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal (id INT AUTO_INCREMENT NOT NULL, theme_id INT DEFAULT NULL, author_id INT DEFAULT NULL, proposal_form_id INT DEFAULT NULL, body LONGTEXT NOT NULL, updated_at DATETIME NOT NULL, rating INT DEFAULT NULL, annotation LONGTEXT DEFAULT NULL, vote_count INT NOT NULL, comments_count INT NOT NULL, is_commentable TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, vote_count_nok INT NOT NULL, vote_count_ok INT NOT NULL, vote_count_mitige INT NOT NULL, enabled TINYINT(1) NOT NULL, trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, INDEX IDX_BFE5947259027487 (theme_id), INDEX IDX_BFE59472F675F31B (author_id), INDEX IDX_BFE59472A52AB36 (proposal_form_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE proposal_form (id INT AUTO_INCREMENT NOT NULL, step_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_72E9E83473B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE proposal_response (id INT AUTO_INCREMENT NOT NULL, proposal_id INT DEFAULT NULL, question_id INT DEFAULT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_DF2037D3F4792058 (proposal_id), INDEX IDX_DF2037D31E27F6BF (question_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE question (id INT AUTO_INCREMENT NOT NULL, proposal_form_id INT DEFAULT NULL, question_type_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, helpText LONGTEXT NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_B6F7494EA52AB36 (proposal_form_id), INDEX IDX_B6F7494ECB90598E (question_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE question_choice (id INT AUTO_INCREMENT NOT NULL, question_id INT DEFAULT NULL, INDEX IDX_C6F6759A1E27F6BF (question_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE question_type (id INT AUTO_INCREMENT NOT NULL, type INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D3F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D31E27F6BF FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id)'
        );
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494ECB90598E FOREIGN KEY (question_type_id) REFERENCES question_type (id)'
        );
        $this->addSql(
            'ALTER TABLE question_choice ADD CONSTRAINT FK_C6F6759A1E27F6BF FOREIGN KEY (question_id) REFERENCES question (id)'
        );
        $this->addSql('ALTER TABLE comment ADD proposal_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526CF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_9474526CF4792058 ON comment (proposal_id)');
        $this->addSql('ALTER TABLE votes ADD proposal_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACFF4792058 ON votes (proposal_id)');
        $this->addSql('ALTER TABLE fos_user ADD projects_count INT NOT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472A52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE5947259027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE proposal_form ADD slug VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE question ADD slug VARCHAR(255) NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472F675F31B');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472A52AB36');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE5947259027487');
        $this->addSql('ALTER TABLE proposal_form DROP slug');
        $this->addSql('ALTER TABLE question DROP slug');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF4792058');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF4792058');
        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D3F4792058');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D31E27F6BF');
        $this->addSql('ALTER TABLE question_choice DROP FOREIGN KEY FK_C6F6759A1E27F6BF');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494ECB90598E');
        $this->addSql('DROP TABLE proposal');
        $this->addSql('DROP TABLE proposal_form');
        $this->addSql('DROP TABLE proposal_response');
        $this->addSql('DROP TABLE question');
        $this->addSql('DROP TABLE question_choice');
        $this->addSql('DROP TABLE question_type');
        $this->addSql('DROP INDEX IDX_9474526CF4792058 ON comment');
        $this->addSql('ALTER TABLE comment DROP proposal_id');
        $this->addSql('ALTER TABLE fos_user DROP projects_count');
        $this->addSql('DROP INDEX IDX_518B7ACFF4792058 ON votes');
        $this->addSql('ALTER TABLE votes DROP proposal_id');
    }
}
