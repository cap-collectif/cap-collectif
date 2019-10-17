<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191018115354 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE event_review (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', reviewer_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', status ENUM(\'approved\', \'refused\', \'awaiting\'), reason ENUM(\'sex\',\'off\',\'spam\',\'error\',\'off_topic\'), details LONGTEXT DEFAULT NULL, updated_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_4BDAF69470574616 (reviewer_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event_review ADD CONSTRAINT FK_4BDAF69470574616 FOREIGN KEY (reviewer_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE event ADD review_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD deleted_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA73E2E969B FOREIGN KEY (review_id) REFERENCES event_review (id) ON DELETE SET NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3BAE0AA73E2E969B ON event (review_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA73E2E969B');
        $this->addSql('DROP TABLE event_review');
        $this->addSql('DROP INDEX UNIQ_3BAE0AA73E2E969B ON event');
        $this->addSql('ALTER TABLE event DROP review_id, DROP deleted_at');
    }
}
