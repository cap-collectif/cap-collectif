<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220624111846 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove unused sonata fields from user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user DROP timezone, DROP facebook_uid, DROP facebook_name, DROP facebook_data, DROP twitter_uid, DROP twitter_name, DROP twitter_data, DROP gplus_uid, DROP gplus_name, DROP gplus_data, DROP token, DROP two_step_code'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE fos_user ADD timezone VARCHAR(64) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD facebook_uid VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD facebook_name VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD facebook_data LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:json)\', ADD twitter_uid VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD twitter_name VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD twitter_data LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:json)\', ADD gplus_uid VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD gplus_name VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD gplus_data LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:json)\', ADD token VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD two_step_code VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
