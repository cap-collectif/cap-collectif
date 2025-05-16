<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250417142948 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add collect_step_imap_server_config, add consent_internal_communication_token, add is_collect_by_email_enabled';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE collect_step_imap_server_config (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', collect_step_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', server_url VARCHAR(255) NOT NULL, folder VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_72AE8EAB330C62D6 (collect_step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE collect_step_imap_server_config ADD CONSTRAINT FK_72AE8EAB330C62D6 FOREIGN KEY (collect_step_id) REFERENCES step (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE proposal ADD consent_internal_communication_token VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE step ADD is_collect_by_email_enabled TINYINT(1) DEFAULT \'0\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE collect_step_imap_server_config');
        $this->addSql('ALTER TABLE proposal DROP consent_internal_communication_token');
        $this->addSql('ALTER TABLE step DROP is_collect_by_email_enabled');
    }
}
