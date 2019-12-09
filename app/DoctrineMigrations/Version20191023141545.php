<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191023141545 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE sso_configuration CHANGE environment environment ENUM(\'TESTING\', \'PRODUCTION\', \'NONE\') COMMENT \'(DC2Type:enum_sso_environment)\' DEFAULT \'NONE\' NOT NULL COMMENT \'(DC2Type:enum_sso_environment)\''
        );
    }

    public function postUp(Schema $schema)
    {
        $this->connection->update(
            'sso_configuration',
            ['environment' => 'NONE'],
            ['environment' => '']
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
            'ALTER TABLE sso_configuration CHANGE environment environment ENUM(\'TESTING\', \'PRODUCTION\', \'NONE\') COMMENT \'(DC2Type:enum_sso_environment)\' DEFAULT \'\' NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:enum_sso_environment)\''
        );
    }
}
