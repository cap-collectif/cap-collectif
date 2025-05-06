<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220207182122 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'sso_configuration.disconnect_sso_on_logout';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE sso_configuration ADD disconnect_sso_on_logout TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE sso_configuration DROP disconnect_sso_on_logout');
    }
}
