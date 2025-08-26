<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250820093322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add app_logs table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE app_logs (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', created_at DATETIME NOT NULL, action_type VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, ip VARCHAR(255) DEFAULT NULL, entity_id VARCHAR(36) DEFAULT NULL, entity_type VARCHAR(255) DEFAULT NULL, INDEX IDX_F5A1E3FCA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE app_logs ADD CONSTRAINT FK_F5A1E3FCA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE app_logs');
    }
}
