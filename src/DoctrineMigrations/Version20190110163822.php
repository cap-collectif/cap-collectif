<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20190110163822 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->delete('site_parameter', ['keyname' => 'events.jumbotron.body']);
    }

    public function down(Schema $schema): void
    {
    }
}
