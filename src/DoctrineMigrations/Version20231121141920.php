<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20231121141920 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add entity ParticipantPhoneVerificationSms and property phone_confirmed to Participant';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE participant_phone_verification_sms (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_6B0CF8829D1C3019 (participant_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE participant_phone_verification_sms ADD CONSTRAINT FK_6B0CF8829D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE participant_phone_verification_sms');
    }
}
