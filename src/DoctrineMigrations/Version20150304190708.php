<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150304190708 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE comment ADD event_id INT DEFAULT NULL, ADD objectType VARCHAR(255) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526C71F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_9474526C71F7E88B ON comment (event_id)');
        $this->addSql(
            'ALTER TABLE event ADD comments_count INT NOT NULL, ADD is_commentable TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE idea ADD is_commentable TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C71F7E88B');
        $this->addSql('DROP INDEX IDX_9474526C71F7E88B ON comment');
        $this->addSql('ALTER TABLE comment DROP event_id, DROP objectType');
        $this->addSql('ALTER TABLE event DROP comments_count, DROP is_commentable');
        $this->addSql('ALTER TABLE idea DROP is_commentable');
    }
}
