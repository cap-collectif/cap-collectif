<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220215100803 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove buttonColor and labelColor from SSOConfiguration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sso_configuration DROP button_color, DROP label_color');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sso_configuration ADD button_color VARCHAR(7) CHARACTER SET utf8 DEFAULT \'#7498C0\' NOT NULL COLLATE `utf8_unicode_ci`, ADD label_color VARCHAR(7) CHARACTER SET utf8 DEFAULT \'#FFFFFF\' NOT NULL COLLATE `utf8_unicode_ci`');
    }
}
