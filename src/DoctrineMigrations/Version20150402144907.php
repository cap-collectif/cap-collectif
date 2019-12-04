<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150402144907 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E54B89032C');
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E54B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E54B89032C');
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E54B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
    }
}
