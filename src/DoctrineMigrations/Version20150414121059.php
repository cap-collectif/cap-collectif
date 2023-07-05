<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150414121059 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        // create footer2 colors and set footer2 colors to footer colors
        $footerBgColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.footer.bg']
        );
        $footerTextColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.footer.text']
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
                'is_enabled' => 1,
            ],
            [
                'keyname' => 'color.footer2.text',
                'title' => 'Texte du pied de page secondaire',
                'value' => $footerTextColor,
                'position' => 24,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => 1,
            ],
        ];

        foreach ($newColors as $color) {
            $this->connection->insert('site_color', $color);
        }

        // Set footer colors to header2 colors
        $header2BgColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.header2.bg']
        );
        $header2TextColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.header2.text']
        );

        $this->connection->update(
            'site_color',
            ['value' => $header2BgColor],
            ['keyname' => 'color.footer.bg']
        );
        $this->connection->update(
            'site_color',
            ['value' => $header2TextColor],
            ['keyname' => 'color.footer.text']
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        // set footer colors to footer2 colors
        $footer2BgColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.footer2.bg']
        );
        $footer2TextColor = $this->connection->fetchOne(
            'SELECT value from site_color where keyname= ?',
            ['color.footer2.text']
        );

        $this->connection->update(
            'site_color',
            ['value' => $footer2BgColor],
            ['keyname' => 'color.footer.bg']
        );
        $this->connection->update(
            'site_color',
            ['value' => $footer2TextColor],
            ['keyname' => 'color.footer.text']
        );

        // delete footer2
        $this->connection->delete('site_color', ['keyname' => 'color.footer2.bg']);
        $this->connection->delete('site_color', ['keyname' => 'color.footer2.text']);
    }
}
