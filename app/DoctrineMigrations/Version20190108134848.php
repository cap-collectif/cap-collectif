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
            'keyname' => 'snproposal.paginationalytical-tracking-scripts-on-all-pages',
            'value' => 50,
            'position' => 1,
            'category' => 'settings.performance',
            'type' => 2,
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    public function postDown(Schema $schema)
    {
    }
}
