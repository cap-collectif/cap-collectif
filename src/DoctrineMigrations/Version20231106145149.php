<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231106145149 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'participant_requirement, change identification_code to user_identification_code in participant';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE participant_requirement (participant_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', requirement_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', value TINYINT(1) NOT NULL, INDEX IDX_210CA8D59D1C3019 (participant_id), INDEX IDX_210CA8D57B576F77 (requirement_id), PRIMARY KEY(participant_id, requirement_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE participant_requirement ADD CONSTRAINT FK_210CA8D59D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE participant_requirement ADD CONSTRAINT FK_210CA8D57B576F77 FOREIGN KEY (requirement_id) REFERENCES requirement (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE participant CHANGE identification_code user_identification_code VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_D79F6B11B443B13E FOREIGN KEY (user_identification_code) REFERENCES user_identification_code (identification_code) ON DELETE SET NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D79F6B11B443B13E ON participant (user_identification_code)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE participant_requirement');
        $this->addSql('ALTER TABLE participant DROP FOREIGN KEY FK_D79F6B11B443B13E');
        $this->addSql('DROP INDEX UNIQ_D79F6B11B443B13E ON participant');
        $this->addSql('ALTER TABLE participant CHANGE user_identification_code identification_code VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
    }
}
