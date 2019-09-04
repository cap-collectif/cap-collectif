<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190902120511 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        if (
            empty(
                ($franceConnectSSOConfiguration = $this->connection->fetchAll(
                    "SELECT sc.id FROM sso_configuration AS sc WHERE sc.id = 'franceConnect'"
                ))
            )
        ) {
            $this->addSql("
                INSERT INTO sso_configuration (id, name, enabled, ssoType, environment, authorization_url, access_token_url, user_info_url, logout_url) 
                VALUE ('franceConnect', 'France Connect', false, 'franceconnect', 'TESTING' ,'/api/v1/authorize', '/api/v1/token', '/api/v1/userinfo', '/api/v1/logout')
            ");
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql("DELETE FROM sso_configuration AS sc WHERE sc.id = 'franceConnect' LIMIT 1");
    }
}
