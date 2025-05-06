<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221004163711 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'user_invite.organization and user_invite_email_message.message_type';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_invite ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE user_invite ADD CONSTRAINT FK_A2B00BEA32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A2B00BEA32C8A3DE ON user_invite (organization_id)');
        $this->addSql('ALTER TABLE user_invite_email_message ADD message_type VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_invite DROP FOREIGN KEY FK_A2B00BEA32C8A3DE');
        $this->addSql('DROP INDEX IDX_A2B00BEA32C8A3DE ON user_invite');
        $this->addSql('ALTER TABLE user_invite DROP organization_id');
        $this->addSql('ALTER TABLE user_invite_email_message DROP message_type');
    }
}
