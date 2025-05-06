<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210304102647 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add debate anonymous vote';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE debate_anonymous_vote (id INT AUTO_INCREMENT NOT NULL, debate_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', token VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, ip_address VARCHAR(255) DEFAULT NULL, navigator LONGTEXT DEFAULT NULL, type ENUM(\'FOR\', \'AGAINST\'), INDEX IDX_4CA7FB2439A6B6F6 (debate_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE debate_anonymous_vote ADD CONSTRAINT FK_4CA7FB2439A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE debate_anonymous_vote');
    }
}
