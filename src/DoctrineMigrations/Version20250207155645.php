<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250207155645 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Enlarge "france_connect_id_token" column in "fos_user" table due to FranceConnect v2 larger tokens.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user MODIFY france_connect_id_token VARCHAR(700) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user MODIFY france_connect_id_token VARCHAR(510) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
