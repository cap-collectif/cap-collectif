<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150417155315 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        // create menu colors
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColors = [
            [
                'keyname' => 'color.main_menu.text',
                'title' => 'Libellés du menu',
                'value' => '',
                'position' => 24,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true
            ],
            [
                'keyname' => 'color.main_menu.text_active',
                'title' => 'Libellés du menu au survol et actif',
                'value' => '',
                'position' => 25,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true
            ],
            [
                'keyname' => 'color.main_menu.bg',
                'title' => 'Fond du menu',
                'value' => '',
                'position' => 26,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true
            ],
            [
                'keyname' => 'color.main_menu.bg_active',
                'title' => 'Fond des éléments de menu actif',
                'value' => '',
                'position' => 27,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true
            ]
        ];

        foreach ($newColors as $color) {
            $this->connection->insert('site_color', $color);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        // delete menu colors
        $this->connection->delete('site_color', ['keyname' => 'color.main_menu.text']);
        $this->connection->delete('site_color', ['keyname' => 'color.main_menu.text_active']);
        $this->connection->delete('site_color', ['keyname' => 'color.main_menu.bg']);
        $this->connection->delete('site_color', ['keyname' => 'color.main_menu.bg_active']);
    }
}
