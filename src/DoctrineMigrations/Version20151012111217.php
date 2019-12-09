<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151012111217 extends AbstractMigration
{
    protected $consultations;
    protected $consultation_abstractsteps;
    protected $consultation_events;
    protected $consultation_posts;
    protected $consultation_types;
    protected $theme_consultations;

    public function preUp(Schema $schema): void
    {
        $this->consultations = $this->connection->fetchAll('SELECT * FROM consultation');
        $this->consultation_abstractsteps = $this->connection->fetchAll(
            'SELECT * FROM consultation_abstractstep'
        );
        $this->consultation_events = $this->connection->fetchAll(
            'SELECT * FROM consultation_event'
        );
        $this->consultation_posts = $this->connection->fetchAll('SELECT * FROM consultation_post');
        $this->consultation_types = $this->connection->fetchAll('SELECT * FROM consultation_type');
        $this->theme_consultations = $this->connection->fetchAll(
            'SELECT * FROM theme_consultation'
        );
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation_abstractstep DROP FOREIGN KEY FK_1064E18E62FF6CDF');
        $this->addSql('ALTER TABLE consultation_event DROP FOREIGN KEY FK_4034E88962FF6CDF');
        $this->addSql('ALTER TABLE consultation_post DROP FOREIGN KEY FK_7143EC4762FF6CDF');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2862FF6CDF');
        $this->addSql('ALTER TABLE theme_consultation DROP FOREIGN KEY FK_611B32462FF6CDF');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF0804F7D71');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C804F7D71');
        $this->addSql(
            'CREATE TABLE consultation_step_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(100) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE project_event (event_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_28FB033971F7E88B (event_id), INDEX IDX_28FB0339166D1F9C (project_id), PRIMARY KEY(event_id, project_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE project_post (post_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_631BA4954B89032C (post_id), INDEX IDX_631BA495166D1F9C (project_id), PRIMARY KEY(post_id, project_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE project (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, cover_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, is_enabled TINYINT(1) NOT NULL, exportable TINYINT(1) NOT NULL, published_at DATETIME NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, video VARCHAR(255) DEFAULT NULL, participants_count INT NOT NULL, contributions_count INT NOT NULL, votes_count INT NOT NULL, opinions_ranking_threshold INT DEFAULT NULL, versions_ranking_threshold INT DEFAULT NULL, include_author_in_ranking TINYINT(1) NOT NULL, opinion_term INT NOT NULL, INDEX IDX_2FB3D0EEF675F31B (author_id), INDEX IDX_2FB3D0EE922726E9 (cover_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE theme_project (project_id INT NOT NULL, theme_id INT NOT NULL, INDEX IDX_76D0D5CD166D1F9C (project_id), INDEX IDX_76D0D5CD59027487 (theme_id), PRIMARY KEY(project_id, theme_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE project_abstractstep (id INT AUTO_INCREMENT NOT NULL, project_id INT NOT NULL, step_id INT NOT NULL, position INT NOT NULL, INDEX IDX_79774AB7166D1F9C (project_id), UNIQUE INDEX UNIQ_79774AB773B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE proposal (id INT AUTO_INCREMENT NOT NULL, theme_id INT DEFAULT NULL, step_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, content LONGTEXT NOT NULL, rating INT NOT NULL, annotation LONGTEXT NOT NULL, vote_count INT NOT NULL, comments_count INT NOT NULL, is_commentable TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, vote_count_nok INT NOT NULL, vote_count_ok INT NOT NULL, vote_count_mitige INT NOT NULL, enabled TINYINT(1) NOT NULL, trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_BFE5947259027487 (theme_id), INDEX IDX_BFE5947273B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE project_event ADD CONSTRAINT FK_28FB033971F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_event ADD CONSTRAINT FK_28FB0339166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_post ADD CONSTRAINT FK_631BA4954B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_post ADD CONSTRAINT FK_631BA495166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE theme_project ADD CONSTRAINT FK_76D0D5CD166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_project ADD CONSTRAINT FK_76D0D5CD59027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_abstractstep ADD CONSTRAINT FK_79774AB7166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_abstractstep ADD CONSTRAINT FK_79774AB773B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
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
        $this->addSql('DROP TABLE consultation');
        $this->addSql('DROP TABLE consultation_abstractstep');
        $this->addSql('DROP TABLE consultation_event');
        $this->addSql('DROP TABLE consultation_post');
        $this->addSql('DROP TABLE consultation_type');
        $this->addSql('DROP TABLE theme_consultation');
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->consultations as $c) {
            $this->connection->insert('project', [
                'id' => $c['id'],
                'author_id' => $c['author_id'],
                'cover_id' => $c['cover_id'],
                'title' => $c['title'],
                'slug' => $c['slug'],
                'is_enabled' => $c['is_enabled'],
                'created_at' => $c['created_at'],
                'updated_at' => $c['updated_at'],
                'video' => $c['video'],
                'published_at' => $c['published_at'],
                'participants_count' => $c['participants_count'],
                'contributions_count' => $c['contributions_count'],
                'exportable' => $c['exportable'],
                'votes_count' => $c['votes_count'],
                'opinions_ranking_threshold' => $c['opinions_ranking_threshold'],
                'versions_ranking_threshold' => $c['versions_ranking_threshold'],
                'include_author_in_ranking' => $c['include_author_in_ranking'],
                'opinion_term' => $c['opinion_term']
            ]);
        }

        foreach ($this->consultation_abstractsteps as $cas) {
            $this->connection->insert('project_abstractstep', [
                'id' => $cas['id'],
                'project_id' => $cas['consultation_id'],
                'step_id' => $cas['step_id'],
                'position' => $cas['position']
            ]);
        }

        foreach ($this->consultation_events as $ce) {
            $this->connection->insert('project_event', [
                'event_id' => $ce['event_id'],
                'project_id' => $ce['consultation_id']
            ]);
        }

        foreach ($this->consultation_posts as $cp) {
            $this->connection->insert('project_post', [
                'post_id' => $cp['post_id'],
                'project_id' => $cp['consultation_id']
            ]);
        }

        foreach ($this->consultation_types as $ct) {
            $this->connection->insert('consultation_step_type', [
                'id' => $ct['id'],
                'title' => $ct['title'],
                'created_at' => $ct['created_at'],
                'updated_at' => $ct['updated_at']
            ]);
        }

        foreach ($this->theme_consultations as $tc) {
            $this->connection->insert('theme_project', [
                'theme_id' => $tc['theme_id'],
                'project_id' => $tc['consultation_id']
            ]);
        }

        $this->addSql('CREATE INDEX IDX_9474526CF4792058 ON comment (proposal_id)');
        $this->addSql('DROP INDEX IDX_43B9FE3C804F7D71 ON step');
        $this->addSql(
            'ALTER TABLE step CHANGE consultation_type_id consultation_step_type_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C9637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C9637EA18 ON step (consultation_step_type_id)');
        $this->addSql('ALTER TABLE votes ADD proposal_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACFF4792058 ON votes (proposal_id)');
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

    public function preDown(Schema $schema): void
    {
        $this->consultations = $this->connection->fetchAll('SELECT * FROM project');
        $this->consultation_abstractsteps = $this->connection->fetchAll(
            'SELECT * FROM project_abstractstep'
        );
        $this->consultation_events = $this->connection->fetchAll('SELECT * FROM project_event');
        $this->consultation_posts = $this->connection->fetchAll('SELECT * FROM project_post');
        $this->consultation_types = $this->connection->fetchAll(
            'SELECT * FROM consultation_step_type'
        );
        $this->theme_consultations = $this->connection->fetchAll('SELECT * FROM theme_project');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C9637EA18');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF09637EA18');
        $this->addSql('ALTER TABLE project_event DROP FOREIGN KEY FK_28FB0339166D1F9C');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD28166D1F9C');
        $this->addSql('ALTER TABLE project_post DROP FOREIGN KEY FK_631BA495166D1F9C');
        $this->addSql('ALTER TABLE theme_project DROP FOREIGN KEY FK_76D0D5CD166D1F9C');
        $this->addSql('ALTER TABLE project_abstractstep DROP FOREIGN KEY FK_79774AB7166D1F9C');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF4792058');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF4792058');
        $this->addSql(
            'CREATE TABLE consultation (id INT AUTO_INCREMENT NOT NULL, cover_id INT DEFAULT NULL, author_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, video VARCHAR(255) DEFAULT NULL, published_at DATETIME NOT NULL, participants_count INT NOT NULL, contributions_count INT NOT NULL, exportable TINYINT(1) NOT NULL, votes_count INT NOT NULL, opinions_ranking_threshold INT DEFAULT NULL, versions_ranking_threshold INT DEFAULT NULL, include_author_in_ranking TINYINT(1) NOT NULL, opinion_term INT NOT NULL, INDEX IDX_964685A6F675F31B (author_id), INDEX IDX_964685A6922726E9 (cover_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_abstractstep (id INT AUTO_INCREMENT NOT NULL, consultation_id INT NOT NULL, step_id INT NOT NULL, position INT NOT NULL, UNIQUE INDEX UNIQ_B0564EB073B21E9C (step_id), INDEX IDX_B0564EB062FF6CDF (consultation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_event (event_id INT NOT NULL, consultation_id INT NOT NULL, INDEX IDX_4034E88971F7E88B (event_id), INDEX IDX_4034E88962FF6CDF (consultation_id), PRIMARY KEY(event_id, consultation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_post (post_id INT NOT NULL, consultation_id INT NOT NULL, INDEX IDX_7143EC474B89032C (post_id), INDEX IDX_7143EC4762FF6CDF (consultation_id), PRIMARY KEY(post_id, consultation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(100) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE theme_consultation (consultation_id INT NOT NULL, theme_id INT NOT NULL, INDEX IDX_611B32459027487 (theme_id), INDEX IDX_611B32462FF6CDF (consultation_id), PRIMARY KEY(consultation_id, theme_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_event ADD CONSTRAINT FK_4034E88962FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_event ADD CONSTRAINT FK_4034E88971F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_post ADD CONSTRAINT FK_7143EC474B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_post ADD CONSTRAINT FK_7143EC4762FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_consultation ADD CONSTRAINT FK_611B32459027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_consultation ADD CONSTRAINT FK_611B32462FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP TABLE consultation_step_type');
        $this->addSql('DROP TABLE project_event');
        $this->addSql('DROP TABLE project_post');
        $this->addSql('DROP TABLE project');
        $this->addSql('DROP TABLE theme_project');
        $this->addSql('DROP TABLE project_abstractstep');
        $this->addSql('DROP TABLE proposal');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->consultations as $c) {
            $this->connection->insert('consultation', [
                'id' => $c['id'],
                'author_id' => $c['author_id'],
                'cover_id' => $c['cover_id'],
                'title' => $c['title'],
                'slug' => $c['slug'],
                'is_enabled' => $c['is_enabled'],
                'created_at' => $c['created_at'],
                'updated_at' => $c['updated_at'],
                'video' => $c['video'],
                'published_at' => $c['published_at'],
                'participants_count' => $c['participants_count'],
                'contributions_count' => $c['contributions_count'],
                'exportable' => $c['exportable'],
                'votes_count' => $c['votes_count'],
                'opinions_ranking_threshold' => $c['opinions_ranking_threshold'],
                'versions_ranking_threshold' => $c['versions_ranking_threshold'],
                'include_author_in_ranking' => $c['include_author_in_ranking'],
                'opinion_term' => $c['opinion_term']
            ]);
        }

        foreach ($this->consultation_abstractsteps as $cas) {
            $this->connection->insert('consultation_abstrastep', [
                'id' => $cas['id'],
                'consultation_id' => $cas['project_id'],
                'step_id' => $cas['step_id'],
                'position' => $cas['position']
            ]);
        }

        foreach ($this->consultation_events as $ce) {
            $this->connection->insert('consultation_event', [
                'event_id' => $ce['event_id'],
                'consultation_id' => $ce['project_id']
            ]);
        }

        foreach ($this->consultation_posts as $cp) {
            $this->connection->insert('project_post', [
                'post_id' => $cp['post_id'],
                'consultation_id' => $cp['project_id']
            ]);
        }

        foreach ($this->consultation_types as $ct) {
            $this->connection->insert('consultation_type', [
                'id' => $ct['id'],
                'title' => $ct['title'],
                'created_at' => $ct['created_at'],
                'updated_at' => $ct['updated_at']
            ]);
        }

        foreach ($this->theme_consultations as $tc) {
            $this->connection->insert('theme_consultation', [
                'theme_id' => $tc['theme_id'],
                'consultation_id' => $tc['project_id']
            ]);
        }

        $this->addSql('DROP INDEX IDX_9474526CF4792058 ON comment');
        $this->addSql('ALTER TABLE comment DROP proposal_id');
        $this->addSql('DROP INDEX IDX_5143CD28166D1F9C ON highlighted_content');
        $this->addSql(
            'ALTER TABLE highlighted_content CHANGE project_id consultation_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2862FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_5143CD2862FF6CDF ON highlighted_content (consultation_id)');
        $this->addSql('DROP INDEX IDX_F11F2BF09637EA18 ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_type_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF0804F7D71 FOREIGN KEY (consultation_type_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_F11F2BF0804F7D71 ON opinion_type (consultation_type_id)');
        $this->addSql('DROP INDEX IDX_43B9FE3C9637EA18 ON step');
        $this->addSql(
            'ALTER TABLE step CHANGE consultation_step_type_id consultation_type_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C804F7D71 FOREIGN KEY (consultation_type_id) REFERENCES consultation_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C804F7D71 ON step (consultation_type_id)');
        $this->addSql('DROP INDEX IDX_518B7ACFF4792058 ON votes');
        $this->addSql('ALTER TABLE votes DROP proposal_id');
    }
}
