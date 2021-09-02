<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150831162737 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $colors = [
            [
                'keyname' => 'color.btn.ghost.bg',
                'category' => 'settings.appearance',
                'value' => '#ffffff',
                'position' => 17,
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ],
            [
                'keyname' => 'color.btn.ghost.text',
                'category' => 'settings.appearance',
                'value' => '#1abc9c',
                'position' => 17,
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ],
            [
                'keyname' => 'color.home.bg',
                'category' => 'pages.homepage',
                'value' => '#16a085',
                'position' => '1',
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ],
            [
                'keyname' => 'color.home.title',
                'category' => 'pages.homepage',
                'value' => '#ffffff',
                'position' => 1,
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ],
        ];

        foreach ($colors as $values) {
            $this->connection->insert('site_color', $values);
        }
    }

    public function down(Schema $schema): void
    {
        $colors = [
            'color.btn.ghost.bg',
            'color.btn.ghost.text',
            'color.home.bg',
            'color.home.title',
        ];

        foreach ($colors as $key) {
            $this->connection->delete('site_color', ['keyname' => $key]);
        }
    }
}
