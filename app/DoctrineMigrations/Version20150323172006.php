<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150323172006 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE theme_event (event_id INT NOT NULL, theme_id INT NOT NULL, INDEX IDX_638C814271F7E88B (event_id), INDEX IDX_638C814259027487 (theme_id), PRIMARY KEY(event_id, theme_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_event (event_id INT NOT NULL, consultation_id INT NOT NULL, INDEX IDX_4034E88971F7E88B (event_id), INDEX IDX_4034E88962FF6CDF (consultation_id), PRIMARY KEY(event_id, consultation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE theme_post (post_id INT NOT NULL, theme_id INT NOT NULL, INDEX IDX_104D98B04B89032C (post_id), INDEX IDX_104D98B059027487 (theme_id), PRIMARY KEY(post_id, theme_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_post (post_id INT NOT NULL, consultation_id INT NOT NULL, INDEX IDX_7143EC474B89032C (post_id), INDEX IDX_7143EC4762FF6CDF (consultation_id), PRIMARY KEY(post_id, consultation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE theme_event ADD CONSTRAINT FK_638C814271F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_event ADD CONSTRAINT FK_638C814259027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_event ADD CONSTRAINT FK_4034E88971F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_event ADD CONSTRAINT FK_4034E88962FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_post ADD CONSTRAINT FK_104D98B04B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_post ADD CONSTRAINT FK_104D98B059027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_post ADD CONSTRAINT FK_7143EC474B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_post ADD CONSTRAINT FK_7143EC4762FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA759027487');
        $this->addSql('DROP INDEX IDX_3BAE0AA759027487 ON event');
        $this->addSql('ALTER TABLE event DROP theme_id');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE theme_event');
        $this->addSql('DROP TABLE consultation_event');
        $this->addSql('DROP TABLE theme_post');
        $this->addSql('DROP TABLE consultation_post');
        $this->addSql('ALTER TABLE event ADD theme_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA759027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_3BAE0AA759027487 ON event (theme_id)');
    }
}
