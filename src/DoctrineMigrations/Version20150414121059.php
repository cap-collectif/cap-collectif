<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150414121059 extends AbstractMigration
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
        // create footer2 colors and set footer2 colors to footer colors
        $footerBgColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.footer.bg')
        );
        $footerTextColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.footer.text')
        );

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColors = [
            [
                'keyname' => 'color.footer2.bg',
                'title' => 'Fond du pied de page secondaire',
                'value' => $footerBgColor,
                'position' => 23,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
            [
                'keyname' => 'color.footer2.text',
                'title' => 'Texte du pied de page secondaire',
                'value' => $footerTextColor,
                'position' => 24,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
        ];

        foreach ($newColors as $color) {
            $this->connection->insert('site_color', $color);
        }

        // Set footer colors to header2 colors
        $header2BgColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.header2.bg')
        );
        $header2TextColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.header2.text')
        );

        $this->connection->update(
            'site_color',
            array('value' => $header2BgColor),
            array('keyname' => 'color.footer.bg')
        );
        $this->connection->update(
            'site_color',
            array('value' => $header2TextColor),
            array('keyname' => 'color.footer.text')
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        // set footer colors to footer2 colors
        $footer2BgColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.footer2.bg')
        );
        $footer2TextColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.footer2.text')
        );

        $this->connection->update(
            'site_color',
            array('value' => $footer2BgColor),
            array('keyname' => 'color.footer.bg')
        );
        $this->connection->update(
            'site_color',
            array('value' => $footer2TextColor),
            array('keyname' => 'color.footer.text')
        );

        // delete footer2
        $this->connection->delete('site_color', array('keyname' => 'color.footer2.bg'));
        $this->connection->delete('site_color', array('keyname' => 'color.footer2.text'));
    }
}
