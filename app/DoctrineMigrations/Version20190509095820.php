<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190509095820 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE sso_configuration (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', ssoType VARCHAR(255) NOT NULL, client_id VARCHAR(255) DEFAULT NULL, secret VARCHAR(255) DEFAULT NULL, authorization_url LONGTEXT DEFAULT NULL, access_token_url_id LONGTEXT DEFAULT NULL, user_info_url LONGTEXT DEFAULT NULL, logout_url LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE sso_configuration');
    }
}
