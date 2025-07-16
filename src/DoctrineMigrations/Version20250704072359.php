<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250704072359 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add anonymization_reminder_email_sent_at and anonymization_reminder_email_token';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user ADD anonymization_reminder_email_sent_at DATETIME DEFAULT NULL, ADD anonymization_reminder_email_token VARCHAR(255) DEFAULT NULL');
        $this->addSql('UPDATE fos_user SET anonymization_reminder_email_token = UUID()');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP anonymization_reminder_email_sent_at, DROP anonymization_reminder_email_token');
    }
}
