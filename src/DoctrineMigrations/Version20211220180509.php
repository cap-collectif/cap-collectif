<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211220180509 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE sso_configuration CHANGE ssoType ssoType ENUM(\'franceconnect\', \'oauth2\', \'facebook\', \'saml\', \'cas\', \'twitter\') COMMENT \'(DC2Type:enum_sso_type)\' NOT NULL COMMENT \'(DC2Type:enum_sso_type)\''
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE sso_configuration CHANGE ssoType ssoType VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
