<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150428162449 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
    }

    /**
     * @param Schema $schema
     */
    public function postUp(Schema $schema): void
    {
        // create menu active item color
        $prevColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.main_menu.text_active')
        );

        $this->connection->update(
            'site_color',
            array('title' => "Libellés du menu actif"),
            array('keyname' => 'color.main_menu.text_active')
        );
        $this->connection->update(
            'site_color',
            array('title' => "Fond des éléments de menu au survol et actif"),
            array('keyname' => 'color.main_menu.bg_active')
        );

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColor = [
            'keyname' => 'color.main_menu.text_hover',
            'title' => 'Libellés du menu au survol',
            'value' => $prevColor,
            'position' => 25,
            'updated_at' => $date,
            'created_at' => $date,
            'is_enabled' => true,
        ];

        $this->connection->insert('site_color', $newColor);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->update(
            'site_color',
            array('title' => "Libellés du menu au survol et actif"),
            array('keyname' => 'color.main_menu.text_active')
        );

        $this->connection->update(
            'site_color',
            array('title' => "Fond des éléments de menu actif"),
            array('keyname' => 'color.main_menu.bg_active')
        );

        // delete footer title color
        $this->connection->delete('site_color', array('keyname' => 'color.main_menu.text_hover'));
    }
}
