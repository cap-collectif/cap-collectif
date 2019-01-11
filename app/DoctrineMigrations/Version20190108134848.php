<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20190108134848 extends AbstractMigration
{
    public function up(Schema $schema)
    {
    }

    public function down(Schema $schema)
    {
    }

    public function postUp(Schema $schema)
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', [
            'keyname' => 'proposal.pagination',
            'value' => 50,
            'position' => 1,
            'category' => 'settings.performance',
            'type' => 2,
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
        ]);
    }

    public function postDown(Schema $schema)
    {
    }
}
