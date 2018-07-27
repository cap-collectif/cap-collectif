<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151012111544 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF4792058');
        $this->addSql('DROP TABLE proposal');
        $this->addSql('DROP INDEX FK_9474526CF4792058 ON comment');
        $this->addSql('ALTER TABLE comment DROP proposal_id');
        $this->addSql('DROP INDEX IDX_43B9FE3C804F7D71 ON step');
        $this->addSql(
            'ALTER TABLE step CHANGE consultation_type_id consultation_step_type_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C9637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C9637EA18 ON step (consultation_step_type_id)');
        $this->addSql('DROP INDEX IDX_5143CD2862FF6CDF ON highlighted_content');
        $this->addSql(
            'ALTER TABLE highlighted_content CHANGE consultation_id project_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD28166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_5143CD28166D1F9C ON highlighted_content (project_id)');
        $this->addSql('DROP INDEX IDX_F11F2BF0804F7D71 ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_type_id consultation_step_type_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF09637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'CREATE INDEX IDX_F11F2BF09637EA18 ON opinion_type (consultation_step_type_id)'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal (id INT AUTO_INCREMENT NOT NULL, theme_id INT DEFAULT NULL, step_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, content LONGTEXT NOT NULL, rating INT NOT NULL, annotation LONGTEXT NOT NULL, vote_count INT NOT NULL, comments_count INT NOT NULL, is_commentable TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, vote_count_nok INT NOT NULL, vote_count_ok INT NOT NULL, vote_count_mitige INT NOT NULL, enabled TINYINT(1) NOT NULL, trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_BFE5947259027487 (theme_id), INDEX IDX_BFE5947273B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE5947259027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE5947273B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql('ALTER TABLE comment ADD proposal_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526CF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX FK_9474526CF4792058 ON comment (proposal_id)');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD28166D1F9C');
        $this->addSql('DROP INDEX IDX_5143CD28166D1F9C ON highlighted_content');
        $this->addSql(
            'ALTER TABLE highlighted_content CHANGE project_id consultation_id INT DEFAULT NULL'
        );
        $this->addSql('CREATE INDEX IDX_5143CD2862FF6CDF ON highlighted_content (consultation_id)');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF09637EA18');
        $this->addSql('DROP INDEX IDX_F11F2BF09637EA18 ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_type_id INT DEFAULT NULL'
        );
        $this->addSql('CREATE INDEX IDX_F11F2BF0804F7D71 ON opinion_type (consultation_type_id)');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C9637EA18');
        $this->addSql('DROP INDEX IDX_43B9FE3C9637EA18 ON step');
        $this->addSql(
            'ALTER TABLE step CHANGE consultation_step_type_id consultation_type_id INT DEFAULT NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C804F7D71 ON step (consultation_type_id)');
    }
}
