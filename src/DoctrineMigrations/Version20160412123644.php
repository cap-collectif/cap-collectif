<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160412123644 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user DROP nous_citoyens_id, DROP nous_citoyens_access_token, DROP is_terms_accepted'
        );
        $this->addSql('ALTER TABLE fos_user ADD email_confirmation_sent_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user ADD nous_citoyens_id VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ADD nous_citoyens_access_token VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ADD is_terms_accepted TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE fos_user DROP email_confirmation_sent_at');
    }
}
