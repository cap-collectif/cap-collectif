<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210913154018 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.facebook_access_token to 511char';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user CHANGE facebook_access_token facebook_access_token VARCHAR(511) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user CHANGE facebook_access_token facebook_access_token VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
