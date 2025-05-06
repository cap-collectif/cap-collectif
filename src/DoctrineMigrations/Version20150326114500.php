<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150326114500 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        // Couleurs de section deviennent couleurs du deuxième en-tête
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.header2.bg',
                'title' => "Couleur de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.section.bg']
        );
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.header2.text',
                'title' => "Texte de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.section.text']
        );
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.header2.title',
                'title' => "Titre de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.section.title']
        );

        // Couleurs du body deviennent couleurs de section
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.section.bg', 'title' => 'Fond des sections', 'position' => 2],
            ['keyname' => 'color.body.bg']
        );

        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.section.text',
                'title' => 'Texte des sections',
                'position' => 2,
            ],
            ['keyname' => 'color.body.text']
        );

        // Ajout des couleurs du body
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColors = [
            [
                'keyname' => 'color.body.bg',
                'title' => 'Fond du site',
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
                'value' => '#ffffff',
                'position' => 1,
            ],
            [
                'keyname' => 'color.body.text',
                'title' => 'Texte du site',
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
                'value' => '#333333',
                'position' => 1,
            ],
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
        // Couleurs du body disparaissent
        $newColors = [['keyname' => 'color.body.bg'], ['keyname' => 'color.body.text']];

        foreach ($newColors as $color) {
            $this->connection->delete('site_color', $color);
        }

        // Couleurs des sections deviennent couleurs du body
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.body.bg', 'position' => 1, 'title' => 'Fond du site'],
            ['keyname' => 'color.section.bg']
        );
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.body.text', 'position' => 1, 'title' => 'Texte du site'],
            ['keyname' => 'color.section.text']
        );

        // Couleurs de la deuxième en-tête deviennent couleurs de section
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.section.bg',
                'title' => "Couleur de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.header2.bg']
        );
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.section.text',
                'title' => "Texte de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.header2.text']
        );
        $this->connection->update(
            'site_color',
            [
                'keyname' => 'color.section.title',
                'title' => "Titre de l'en-tête secondaire",
                'position' => 5,
            ],
            ['keyname' => 'color.header2.title']
        );
    }
}
