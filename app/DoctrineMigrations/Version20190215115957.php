<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20190215115957 extends AbstractMigration
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
            'keyname' => 'homepage.jumbotron.share_button',
            'value' => 1,
            'position' => 120,
            'category' => 'pages.homepage',
            'type' => 8,
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
        ]);
    }

    public function postDown(Schema $schema)
    {
    }
}
