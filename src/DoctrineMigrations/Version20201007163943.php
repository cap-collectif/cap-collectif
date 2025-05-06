<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201007163943 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'new entity emailing_campaign';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE emailing_campaign (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, sender_email VARCHAR(255) NOT NULL, sender_name VARCHAR(255) NOT NULL, object VARCHAR(255) NOT NULL, content VARCHAR(255) NOT NULL, mailing_internal VARCHAR(255) DEFAULT NULL, send_at DATETIME DEFAULT NULL, status VARCHAR(255) NOT NULL, mailing_list_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_6016BF9B2C7EF3E4 (mailing_list_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9BDACEFB4F FOREIGN KEY (mailing_list_id) REFERENCES mailing_list (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE emailing_campaign');
    }
}
