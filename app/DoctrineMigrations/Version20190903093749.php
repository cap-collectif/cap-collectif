<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190903093749 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user_connection CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE user_connection ADD CONSTRAINT FK_8E90B58AA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_8E90B58AA76ED395 ON user_connection (user_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user_connection DROP FOREIGN KEY FK_8E90B58AA76ED395');
        $this->addSql('DROP INDEX IDX_8E90B58AA76ED395 ON user_connection');
        $this->addSql('ALTER TABLE user_connection CHANGE user_id user_id VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
    }
}
