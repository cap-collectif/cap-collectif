<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20171018112232 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('site_parameter', [
            'keyname' => 'global.locale',
            'category' => 'settings.global',
            'value' => 'fr-FR',
            'position' => 1,
            'type' => 9,
            'is_enabled' => 1,
            'updated_at' => $date,
            'created_at' => $date,
        ]);
    }

    public function down(Schema $schema): void
    {
    }
}
