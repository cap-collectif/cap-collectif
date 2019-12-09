<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171018112232 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->connection->insert('site_parameter', [
            'keyname' => 'global.locale',
            'category' => 'settings.global',
            'value' => 'fr-FR',
            'position' => 1,
            'type' => 9,
            'is_enabled' => 1
        ]);
    }

    public function down(Schema $schema): void
    {
    }
}
