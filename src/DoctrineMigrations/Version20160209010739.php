<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160209010739 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColors = [
            [
                'keyname' => 'color.votes_bar.bg',
                'category' => 'settings.appearance',
                'value' => '#F6F6F6',
                'position' => 29,
                'updated_at' => $date,
                'created_at' => $date,
            ],
            [
                'keyname' => 'color.votes_bar.text',
                'category' => 'settings.appearance',
                'value' => '#777777',
                'position' => 30,
                'updated_at' => $date,
                'created_at' => $date,
            ],
            [
                'keyname' => 'color.votes_bar.border',
                'category' => 'settings.appearance',
                'value' => '#E7E7E7',
                'position' => 31,
                'updated_at' => $date,
                'created_at' => $date,
            ],
            [
                'keyname' => 'color.votes_bar.btn.bg',
                'category' => 'settings.appearance',
                'value' => '#FFFFFF',
                'position' => 32,
                'updated_at' => $date,
                'created_at' => $date,
            ],
            [
                'keyname' => 'color.votes_bar.btn.text',
                'category' => 'settings.appearance',
                'value' => '#000000',
                'position' => 33,
                'updated_at' => $date,
                'created_at' => $date,
            ],
        ];

        foreach ($newColors as $color) {
            $this->connection->insert('site_color', $color);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        $colors = [
            'color.votes_bar.bg',
            'color.votes_bar.text',
            'color.votes_bar.border',
            'color.votes_bar.btn.bg',
            'color.votes_bar.btn.text',
        ];

        foreach ($colors as $color) {
            $this->connection->delete('site_color', ['keyname' => $color]);
        }
    }
}
