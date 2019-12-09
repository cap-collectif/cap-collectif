<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20190110163822 extends AbstractMigration
{
    public function up(Schema $schema)
    {
    }

    public function postUp(Schema $schema)
    {
        $this->connection->delete('site_parameter', ['keyname' => 'events.jumbotron.body']);
    }

    public function down(Schema $schema)
    {
    }
}
