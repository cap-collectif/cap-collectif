<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250821134254 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add participant_id to mailing_list_user and migrate old data to new schema';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE mailing_list_user_old LIKE mailing_list_user');
        $this->addSql('INSERT INTO mailing_list_user_old SELECT * FROM mailing_list_user');
        $this->addSql('DROP TABLE mailing_list_user');

        $this->addSql('CREATE TABLE mailing_list_user (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', mailing_list_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_FA5879EF2C7EF3E4 (mailing_list_id), INDEX IDX_FA5879EFA76ED395 (user_id), INDEX IDX_FA5879EF9D1C3019 (participant_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EF2C7EF3E4 FOREIGN KEY (mailing_list_id) REFERENCES mailing_list (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EFA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EF9D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');

        $this->addSql('INSERT INTO mailing_list_user (id, mailing_list_id, user_id) SELECT UUID(), mailinglist_id, user_id FROM mailing_list_user_old');
        $this->addSql('DROP TABLE mailing_list_user_old');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE mailing_list_user DROP FOREIGN KEY FK_FA5879EF2C7EF3E4');
        $this->addSql('ALTER TABLE mailing_list_user DROP FOREIGN KEY FK_FA5879EF9D1C3019');
        $this->addSql('DROP INDEX IDX_FA5879EF2C7EF3E4 ON mailing_list_user');
        $this->addSql('DROP INDEX IDX_FA5879EF9D1C3019 ON mailing_list_user');
        $this->addSql('ALTER TABLE mailing_list_user DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE mailing_list_user DROP mailing_list_id, DROP participant_id, CHANGE user_id user_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\', CHANGE id mailinglist_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EF1573C2D3 FOREIGN KEY (mailinglist_id) REFERENCES mailing_list (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FA5879EF1573C2D3 ON mailing_list_user (mailinglist_id)');
        $this->addSql('ALTER TABLE mailing_list_user ADD PRIMARY KEY (mailinglist_id, user_id)');
    }
}
