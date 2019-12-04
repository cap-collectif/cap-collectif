<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20190215115957 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', [
            'keyname' => 'homepage.jumbotron.share_button',
            'value' => 0,
            'position' => 120,
            'category' => 'pages.homepage',
            'type' => 8,
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 0,
        ]);
    }

    public function postDown(Schema $schema): void
    {
    }
}
