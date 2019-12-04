<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150413162136 extends AbstractMigration
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
            'ALTER TABLE fos_user ADD idea_comments_count INT NOT NULL, ADD post_comments_count INT NOT NULL, ADD event_comments_count INT NOT NULL, ADD idea_votes_count INT NOT NULL, ADD comment_votes_count INT NOT NULL, ADD opinion_votes_count INT NOT NULL, ADD source_votes_count INT NOT NULL, ADD argument_votes_count INT NOT NULL, DROP comments_count, DROP votes_count'
        );
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

        $this->addSql(
            'ALTER TABLE fos_user ADD comments_count INT NOT NULL, ADD votes_count INT NOT NULL, DROP idea_comments_count, DROP post_comments_count, DROP event_comments_count, DROP idea_votes_count, DROP comment_votes_count, DROP opinion_votes_count, DROP source_votes_count, DROP argument_votes_count'
        );
    }
}
