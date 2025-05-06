<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160928160654 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE step CHANGE default_status_id default_status_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CFA95281A FOREIGN KEY (default_status_id) REFERENCES status (id)'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3CFA95281A ON step (default_status_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CFA95281A');
        $this->addSql('DROP INDEX IDX_43B9FE3CFA95281A ON step');
        $this->addSql(
            'ALTER TABLE step CHANGE default_status_id default_status_id VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci'
        );
    }
}
