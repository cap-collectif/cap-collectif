<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251225110800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add participant anonymization reminder fields';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participant ADD anonymization_reminder_email_sent_at DATETIME DEFAULT NULL, ADD anonymization_reminder_email_token VARCHAR(255) DEFAULT NULL');
        $this->addSql('UPDATE participant SET anonymization_reminder_email_token = UUID() WHERE anonymization_reminder_email_token IS NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participant DROP anonymization_reminder_email_sent_at, DROP anonymization_reminder_email_token');
    }
}
