<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240913085738 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add ON DELETE CASCADE to participant_phone_verification_sms table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE participant_phone_verification_sms DROP FOREIGN KEY FK_6B0CF8829D1C3019');
        $this->addSql('ALTER TABLE participant_phone_verification_sms ADD CONSTRAINT FK_6B0CF8829D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE participant_phone_verification_sms DROP FOREIGN KEY FK_6B0CF8829D1C3019');
        $this->addSql('ALTER TABLE participant_phone_verification_sms ADD CONSTRAINT FK_6B0CF8829D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
    }
}
