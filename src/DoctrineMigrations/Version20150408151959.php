<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150408151959 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE highlighted_content (id INT AUTO_INCREMENT NOT NULL, post_id INT DEFAULT NULL, theme_id INT DEFAULT NULL, consultation_id INT DEFAULT NULL, idea_id INT DEFAULT NULL, event_id INT DEFAULT NULL, position INT NOT NULL, object_type VARCHAR(255) NOT NULL, INDEX IDX_5143CD284B89032C (post_id), INDEX IDX_5143CD2859027487 (theme_id), INDEX IDX_5143CD2862FF6CDF (consultation_id), INDEX IDX_5143CD285B6FEF7D (idea_id), INDEX IDX_5143CD2871F7E88B (event_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD284B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2859027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2862FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD285B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2871F7E88B FOREIGN KEY (event_id) REFERENCES event (id)'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->insert('section', [
            'position' => 1,
            'type' => 'highlight',
            'title' => 'A la une',
            'enabled' => true
        ]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE highlighted_content');
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('section', ['type' => 'highlight']);
    }
}
