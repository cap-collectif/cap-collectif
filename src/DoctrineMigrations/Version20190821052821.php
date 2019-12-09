<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190821052821 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE sso_configuration ADD environment ENUM(\'TESTING\', \'PRODUCTION\', \'\') DEFAULT \'\' NOT NULL COMMENT \'(DC2Type:enum_sso_environment)\''
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD france_connect_id VARCHAR(255) DEFAULT NULL, ADD france_connect_access_token VARCHAR(255) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user DROP france_connect_id, DROP france_connect_access_token'
        );
        $this->addSql('ALTER TABLE sso_configuration DROP environment');
    }
}
