<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210927143920 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.france_connect_id_token';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user ADD france_connect_id_token VARCHAR(510) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP france_connect_id_token');
    }
}
