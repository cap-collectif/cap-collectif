<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20190212115338 extends AbstractMigration
{
    public function postUp(Schema $schema)
    {
        $this->connection->insert('site_parameter', [
            'keyname' => 'cookies-list',
            'category' => 'pages.cookies',
            'position' => 3,
            'type' => 1,
        ]);
        $id = $this->connection->lastInsertId();
        $this->connection->update(
            'site_parameter',
            [
                'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
                'updated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            ],
            ['id' => $id]
        );
    }

    public function up(Schema $schema)
    {
    }

    public function down(Schema $schema)
    {
    }
}
