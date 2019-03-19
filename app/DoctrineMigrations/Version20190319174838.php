<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190319174838 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE acl_classes CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL');
        $this->addSql(
            'ALTER TABLE acl_security_identities CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE acl_object_identities CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL'
        );
        $this->addSql('ALTER TABLE acl_entries CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE acl_classes CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL');
        $this->addSql('ALTER TABLE acl_entries CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL');
        $this->addSql(
            'ALTER TABLE acl_object_identities CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE acl_security_identities CHANGE id id INT UNSIGNED AUTO_INCREMENT NOT NULL'
        );
    }
}
