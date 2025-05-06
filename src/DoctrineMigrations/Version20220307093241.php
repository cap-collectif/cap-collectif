<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220307093241 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'drop expires_at from user_phone_verification_sms';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_phone_verification_sms DROP expires_at, DROP code');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_phone_verification_sms ADD expires_at DATETIME NOT NULL, ADD code VARCHAR(6) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`');
    }
}
