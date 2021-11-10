<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211029200919 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add reply_anonymous';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE reply_anonymous (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', questionnaire_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, ip_address VARCHAR(255) DEFAULT NULL, navigator LONGTEXT DEFAULT NULL, published TINYINT(1) NOT NULL, publishedAt DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, token VARCHAR(255) NOT NULL, participant_email VARCHAR(255) DEFAULT NULL, INDEX IDX_F939C20CE07E8FF (questionnaire_id), INDEX idx_questionnaire_published (id, questionnaire_id, published, publishedAt), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE reply_anonymous ADD CONSTRAINT FK_F939C20CE07E8FF FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE response ADD reply_anonymous_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFBEAFE8437 FOREIGN KEY (reply_anonymous_id) REFERENCES reply_anonymous (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_3E7B0BFBEAFE8437 ON response (reply_anonymous_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFBEAFE8437');
        $this->addSql('DROP TABLE reply_anonymous');
        $this->addSql('DROP INDEX IDX_3E7B0BFBEAFE8437 ON response');
        $this->addSql('ALTER TABLE response DROP reply_anonymous_id');
    }
}
