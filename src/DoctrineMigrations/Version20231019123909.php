<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231019123909 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add participant';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE participant (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', email VARCHAR(255) DEFAULT NULL, lastname VARCHAR(255) DEFAULT NULL, firstname VARCHAR(255) DEFAULT NULL, phone VARCHAR(255) DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, zip_code VARCHAR(10) DEFAULT NULL, date_of_birth DATETIME DEFAULT NULL, identification_code VARCHAR(255) DEFAULT NULL, phone_confirmed TINYINT(1) NOT NULL, token VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE fos_user ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A64799D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64799D1C3019 ON fos_user (participant_id)');
        $this->addSql('ALTER TABLE proposal ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594729D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_BFE594729D1C3019 ON proposal (participant_id)');
        $this->addSql('ALTER TABLE reply ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E09D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_FDA8C6E09D1C3019 ON reply (participant_id)');
        $this->addSql('ALTER TABLE votes ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF9D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_518B7ACF9D1C3019 ON votes (participant_id)');
        $this->addSql('CREATE UNIQUE INDEX participant_vote_unique ON votes (voter_id, participant_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A64799D1C3019');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594729D1C3019');
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E09D1C3019');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF9D1C3019');
        $this->addSql('DROP TABLE participant');
        $this->addSql('DROP INDEX UNIQ_957A64799D1C3019 ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP participant_id');
        $this->addSql('DROP INDEX IDX_BFE594729D1C3019 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP participant_id');
        $this->addSql('DROP INDEX IDX_FDA8C6E09D1C3019 ON reply');
        $this->addSql('ALTER TABLE reply DROP participant_id');
        $this->addSql('DROP INDEX IDX_518B7ACF9D1C3019 ON votes');
        $this->addSql('DROP INDEX participant_vote_unique ON votes');
        $this->addSql('ALTER TABLE votes DROP participant_id');
    }
}
