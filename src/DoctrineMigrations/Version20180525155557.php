<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180525155557 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user CHANGE email_canonical email_canonical VARCHAR(255) DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE fos_user ADD deleted_account_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE fos_user ADD proposal_comments_count INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user CHANGE email_canonical email_canonical VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql('ALTER TABLE fos_user DROP deleted_account_at');
        $this->addSql('ALTER TABLE fos_user DROP proposal_comments_count');
    }
}
