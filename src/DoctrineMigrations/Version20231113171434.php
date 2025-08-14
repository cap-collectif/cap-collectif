<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231113171434 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add XXXX to participant';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE participant ADD username VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE participant ADD consent_sms_communication TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE participant ADD email_confirmation_sent_at DATETIME DEFAULT NULL, ADD new_email_to_confirm VARCHAR(255) DEFAULT NULL, ADD new_email_confirmation_token VARCHAR(255) DEFAULT NULL, ADD confirmation_token VARCHAR(255) DEFAULT NULL, ADD locale VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE participant ADD consent_internal_communication TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE participant ADD updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE participant ADD zip_code VARCHAR(10) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE participant DROP username');
        $this->addSql('ALTER TABLE participant DROP consent_sms_communication');
        $this->addSql('ALTER TABLE participant DROP email_confirmation_sent_at, DROP new_email_to_confirm, DROP new_email_confirmation_token, DROP confirmation_token, DROP locale');
        $this->addSql('ALTER TABLE participant DROP consent_internal_communication');
        $this->addSql('ALTER TABLE participant DROP updated_at');
        $this->addSql('ALTER TABLE participant DROP zip_code');
    }
}
