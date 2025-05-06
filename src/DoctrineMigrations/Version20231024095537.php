<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231024095537 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'switch participant_id from fos_user to user_id in participant';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A64799D1C3019');
        $this->addSql('DROP INDEX UNIQ_957A64799D1C3019 ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP participant_id');
        $this->addSql('ALTER TABLE participant ADD user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_D79F6B11A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D79F6B11A76ED395 ON participant (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user ADD participant_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A64799D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64799D1C3019 ON fos_user (participant_id)');
        $this->addSql('ALTER TABLE participant DROP FOREIGN KEY FK_D79F6B11A76ED395');
        $this->addSql('DROP INDEX UNIQ_D79F6B11A76ED395 ON participant');
        $this->addSql('ALTER TABLE participant DROP user_id');
    }
}
