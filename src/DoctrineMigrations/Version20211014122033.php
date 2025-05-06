<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211014122033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'create_table.user_identification_code';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_identification_code (identification_code VARCHAR(255) NOT NULL, PRIMARY KEY(identification_code)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('DROP INDEX UNIQ_957A64799E80DE4C ON fos_user');
        $this->addSql('ALTER TABLE fos_user CHANGE identification_code user_identification_code VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479B443B13E FOREIGN KEY (user_identification_code) REFERENCES user_identification_code (identification_code)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479B443B13E ON fos_user (user_identification_code)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479B443B13E');
        $this->addSql('DROP TABLE user_identification_code');
        $this->addSql('DROP INDEX UNIQ_957A6479B443B13E ON fos_user');
        $this->addSql('ALTER TABLE fos_user CHANGE user_identification_code identification_code VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64799E80DE4C ON fos_user (identification_code)');
    }
}
